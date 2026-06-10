import { useState, useRef, useCallback } from 'react';
import { getRafaGymAssistant } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import {
    getLocations,
    getMembershipTypes,
    getClientMeasurements,
    getClientFullDetail,
} from '../lib/services';

// ─── Constantes ─────────────────────────────────────────────────────────────
const MAX_FUNCTION_CALL_LOOPS = 5; // Evita bucles infinitos de tool calls

// ─── Mensaje de bienvenida dinámico ─────────────────────────────────────────
function buildWelcomeMessage(userName) {
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? '¡Buenos días' :
        hour < 18 ? '¡Buenas tardes' :
                    '¡Buenas noches';
    const name = userName ? `, ${userName.split(' ')[0]}` : '';
    return `${greeting}${name}! 💪 Soy RafaBot, tu asistente de RafaGym. ¿En qué te puedo ayudar hoy?\n\nPuedo contarte sobre tus rutinas, clases, pagos, asistencias, medidas corporales, planes de membresía o simplemente darte consejos de entrenamiento.`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useGymChat() {
    const { user } = useAuth();

    const [messages, setMessages] = useState(() => [
        { role: 'model', text: buildWelcomeMessage(user?.name) },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // Guardamos la sesión en un ref para no disparar re-renders ni
    // perder la referencia entre llamadas asíncronas.
    const sessionRef = useRef(null);
    // Guardamos también el clientContext para no recrear el modelo si ya existe sesión.
    const clientContextRef = useRef(null);

    // ─── Mapa de herramientas disponibles ────────────────────────────────────
    const gymFunctions = useCallback(() => ({
        getSedesGimnasio: async () => {
            const sedes = await getLocations();
            if (!sedes.length) return { mensaje: 'No se encontraron sedes registradas.' };
            return {
                total_sedes: sedes.length,
                sedes: sedes.map(s => ({
                    nombre: s.name,
                    direccion: s.address || 'No especificada',
                    horario_apertura: s.open_time || null,
                    horario_cierre: s.close_time || null,
                    telefono: s.phone || null,
                })),
            };
        },

        getMembresiasGimnasio: async () => {
            const planes = await getMembershipTypes();
            if (!planes.length) return { mensaje: 'No hay planes de membresía disponibles.' };
            return {
                total_planes: planes.length,
                planes: planes.map(p => ({
                    nombre: p.name,
                    precio: p.price,
                    duracion_dias: p.duration_days || null,
                    descripcion: p.description || null,
                    beneficios: p.benefits || null,
                })),
            };
        },

        getMisMedidas: async () => {
            if (!user?.id) return { error: 'No se pudo identificar al usuario.' };
            const historial = await getClientMeasurements(user.id);
            if (!historial.length) {
                return { mensaje: 'Aún no tienes medidas registradas. Puedes agregarlas en la sección "Mis Medidas" (/portal/measurements).' };
            }
            const ultima = historial[historial.length - 1];
            const primera = historial[0];
            return {
                total_registros: historial.length,
                ultima_medicion: {
                    fecha: ultima.measurement_date,
                    peso_kg: ultima.weight_kg,
                    grasa_corporal_pct: ultima.body_fat_pct,
                    imc: ultima.bmi,
                    cintura_cm: ultima.waist_cm,
                    cadera_cm: ultima.hip_cm,
                    pecho_cm: ultima.chest_cm,
                    bicep_cm: ultima.bicep_cm,
                    registrado_por: ultima.registrador_name,
                    notas: ultima.notes,
                },
                primera_medicion: {
                    fecha: primera.measurement_date,
                    peso_kg: primera.weight_kg,
                    grasa_corporal_pct: primera.body_fat_pct,
                },
                // Tendencia de peso para análisis
                progreso_peso: historial
                    .filter(m => m.weight_kg != null)
                    .map(m => ({ fecha: m.measurement_date, peso_kg: m.weight_kg })),
            };
        },

        getMiPerfilCompleto: async () => {
            if (!user?.id) return { error: 'No se pudo identificar al usuario.' };
            const perfil = await getClientFullDetail(user.id);

            // Enriquecemos el resumen para que Gemini lo interprete mejor
            const resumen = {
                nombre_cliente: user.name,
                rutinas: perfil.routines.length
                    ? perfil.routines.map(r => ({
                        nombre: r.name,
                        objetivo: r.objective,
                        nivel: r.level,
                        duracion: r.duration,
                        dias_entrenamiento: r.days,
                        entrenador: r.trainer_name,
                        notas: r.notes,
                    }))
                    : 'No tiene rutinas asignadas actualmente.',

                clases_inscritas: perfil.classes.length
                    ? perfil.classes.map(c => ({
                        nombre_clase: c.class_name,
                        dias: c.days_of_week,
                        horario: `${c.start_time} - ${c.end_time}`,
                        instructor: c.instructor,
                        sede: c.location_name,
                    }))
                    : 'No está inscrito en clases grupales actualmente.',

                ultimas_asistencias: perfil.attendances.length
                    ? perfil.attendances.map(a => ({
                        fecha: a.date,
                        hora: a.time,
                        sede: a.location_name,
                    }))
                    : 'No hay registros de asistencia recientes.',

                total_asistencias_recientes: perfil.attendances.length,

                ultimos_pagos: perfil.payments.length
                    ? perfil.payments.map(p => ({
                        fecha: p.date,
                        monto: p.amount,
                        concepto: p.concept || 'Pago de membresía',
                        estado: p.status,
                    }))
                    : 'No hay pagos registrados recientemente.',
            };

            return { perfil_cliente: resumen };
        },
    }), [user]);

    // ─── Lógica central de envío ─────────────────────────────────────────────
    const sendMessage = useCallback(async (userText) => {
        if (!userText.trim() || isLoading) return;

        // Añadir mensaje del usuario a la UI inmediatamente
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            // Inicializar sesión de chat si no existe (incluye contexto del cliente)
            if (!sessionRef.current) {
                const clientContext = {
                    name: user?.name || null,
                    membershipName: null, // Se podría pasar desde el componente si se tiene
                };
                clientContextRef.current = clientContext;
                const assistant = getRafaGymAssistant(clientContext);
                sessionRef.current = assistant.startChat({ history: [] });
            }

            const session = sessionRef.current;
            const functions = gymFunctions();

            // ── Bucle de tool calls ─────────────────────────────────────────
            // Gemini puede encadenar múltiples tool calls antes de responder al usuario.
            let result = await session.sendMessage(userText);
            let loopCount = 0;

            while (loopCount < MAX_FUNCTION_CALL_LOOPS) {
                const functionCalls = result.response.functionCalls?.() ?? [];
                if (!functionCalls.length) break; // No más tool calls → respuesta final

                loopCount++;
                console.log(`[RafaBot] Tool calls en turno ${loopCount}:`, functionCalls.map(f => f.name));

                // Ejecutar TODAS las tool calls del turno en paralelo
                const toolResponses = await Promise.all(
                    functionCalls.map(async (fc) => {
                        let response;
                        if (functions[fc.name]) {
                            try {
                                response = await functions[fc.name](fc.args);
                            } catch (err) {
                                console.error(`[RafaBot] Error en ${fc.name}:`, err);
                                response = { error: `Error al obtener datos: ${err.message}` };
                            }
                        } else {
                            response = { error: `La herramienta "${fc.name}" no está implementada.` };
                        }
                        return {
                            functionResponse: {
                                name: fc.name,
                                response,
                            },
                        };
                    })
                );

                // Devolver los resultados de las tools a Gemini
                result = await session.sendMessage(toolResponses);
            }

            if (loopCount >= MAX_FUNCTION_CALL_LOOPS) {
                console.warn('[RafaBot] Se alcanzó el límite de tool call loops.');
            }

            // Extraer respuesta de texto final
            const botReply = result.response.text();
            if (!botReply.trim()) throw new Error('Respuesta vacía de Gemini');

            setMessages(prev => [...prev, { role: 'model', text: botReply }]);

        } catch (error) {
            console.error('[RafaBot] Error:', error);

            let errorMsg = 'Ups, tuve un problema interno. ¿Puedes intentarlo de nuevo? 🙏';
            if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
                errorMsg = 'Hay un problema con la configuración del servicio. Contacta al soporte de RafaGym.';
            } else if (error.message?.includes('quota') || error.message?.includes('429')) {
                errorMsg = 'El servicio está algo ocupado en este momento. Espera un segundo e inténtalo de nuevo.';
            }

            setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, user, gymFunctions]);

    // Permite resetear la conversación (nueva sesión)
    const resetChat = useCallback(() => {
        sessionRef.current = null;
        clientContextRef.current = null;
        setMessages([{ role: 'model', text: buildWelcomeMessage(user?.name) }]);
    }, [user?.name]);

    return { messages, sendMessage, isLoading, resetChat };
}