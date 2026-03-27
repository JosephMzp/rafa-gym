import './Home.css'

var MEMBERSHIP_TYPES = [
    { id: 1, name: 'Estándar', price: 89.90, icon: '🥉', features: ['Acceso a 1 sede', '1 ingreso/día', 'Zona de máquinas'] },
    { id: 2, name: 'Fit', price: 149.90, icon: '🥈', features: ['Acceso a todas las sedes', '1 ingreso/día', 'Asesoramiento', 'Clases grupales gratis'] },
    { id: 3, name: 'Gold', price: 219.90, icon: '🥇', features: ['Acceso ilimitado', 'Ingresos ilimitados', 'Asesoramiento', 'Clases grupales gratis', '5 invitados/mes'] }
]

var LOCATIONS = [
    { id: 1, name: 'RafaGym - Sede Av. San Juan', address: 'Av. Guillermo Billinghurst 497, S.J.M 15801', phone: '01-234-5678', hours: 'Lun-Sab 5:00am - 10:00pm', services: ['Musculación', 'Cardio', 'Funcional', 'Pilates'], image: '/public/av san juan.PNG' },
    { id: 2, name: 'RafaGym - Sede Pebal', address: 'Av Salvador Allende 314, Lima 15043', phone: '01-345-6789', hours: 'Lun-Sab 5:00am - 10:00pm', services: ['Musculación', 'Cardio', 'Danza', 'Aeróbicos'], image: '/public/PEBAL.png' },
    { id: 3, name: 'RafaGym - Sede Parque 12', address: 'Mz.Ñ4 Lt 8-9 calle apurimac Sector, S.J.M 14804', phone: '01-456-7890', hours: 'Lun-Sab 6:00am - 9:00pm', services: ['Musculación', 'Cardio', 'Funcional'], image: '/public/12 NOV.PNG' }
]

export default function Home() {
    return (
        <div className="home-page">
            {/* ─── Hero Section ─── */}
            <section className="hero" id="hero">
                <div className="hero-bg">
                    <div className="hero-glow" />
                    <div className="hero-grid-pattern" />
                </div>
                <div className="container hero-content">
                    <div className="hero-text animate-slide-up">
                        <div className="hero-badge"> Más de 200 clientes activos</div>
                        <h1 className="hero-title">
                            Transforma tu <span className="gradient-text">cuerpo</span> y tu <span className="gradient-text">vida</span>
                        </h1>
                        <p className="hero-subtitle">
                            3 sedes equipadas con tecnología de punta, entrenadores certificados y los mejores planes para alcanzar tus objetivos fitness.
                        </p>
                        <div className="hero-actions">
                            <a href="#membresias" className="btn btn-primary btn-lg">
                                Ver Planes
                            </a>
                            <a href="#sedes" className="btn btn-secondary btn-lg">
                                Nuestras Sedes
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-value">3</span>
                                <span className="hero-stat-label">Sedes</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">50+</span>
                                <span className="hero-stat-label">Equipos</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">15+</span>
                                <span className="hero-stat-label">Entrenadores</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">5+</span>
                                <span className="hero-stat-label">Años</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-in">
                        <div className="hero-image-card glass">
                            <div className="hero-image-placeholder">
                                <img src="/public/Captura.PNG" alt="Hombre levantando pesas" className="hero-image" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none"><path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H0Z" fill="var(--dark-900)" /></svg>
                </div>
            </section>

            {/* ─── Services Section ─── */}
            <section className="section" id="servicios">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Nuestros <span className="gradient-text">Servicios</span></h2>
                        <p className="section-subtitle">Todo lo que necesitas para alcanzar tus metas fitness en un solo lugar</p>
                    </div>
                    <div className="services-grid">
                        {[
                            { icon: '🏋️', title: 'Musculación', desc: 'Zona completa de máquinas y peso libre para desarrollo muscular.' },
                            { icon: '🫀', title: 'Cardio', desc: 'Equipos de última generación: cintas, bicicletas, elípticas.' },
                            { icon: '🤸', title: 'Funcional', desc: 'Entrenamientos dinámicos para mejorar fuerza y resistencia.' },
                            { icon: '🧘', title: 'Pilates & Yoga', desc: 'Clases grupales para flexibilidad, balance y bienestar.' },
                            { icon: '💃', title: 'Danza & Aeróbicos', desc: 'Clases energéticas para quemar calorías mientras te diviertes.' },
                            { icon: '📋', title: 'Asesoramiento', desc: 'Rutinas personalizadas y seguimiento de progreso por entrenadores.' }
                        ].map((s, i) => (
                            <div key={i} className="service-card card" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="service-icon">{s.icon}</div>
                                <h3 className="service-title">{s.title}</h3>
                                <p className="service-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Membership Plans ─── */}
            <section className="section section-dark" id="membresias">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Planes de <span className="gradient-text">Membresía</span></h2>
                        <p className="section-subtitle">Elige el plan perfecto para ti y comienza tu transformación hoy</p>
                    </div>
                    <div className="membership-grid">
                        {MEMBERSHIP_TYPES.map((plan, i) => (
                            <div key={plan.id} className={`membership-card ${i === 2 ? 'featured' : ''}`}>
                                {i === 2 && <div className="membership-badge">⭐ Más Popular</div>}
                                <div className="membership-icon">{plan.icon}</div>
                                <h3 className="membership-name">{plan.name}</h3>
                                <div className="membership-price">
                                    <span className="currency">S/</span>
                                    <span className="amount">{plan.price.toFixed(0)}</span>
                                    <span className="period">/mes</span>
                                </div>
                                <ul className="membership-features">
                                    {plan.features.map((f, j) => (
                                        <li key={j}><span className="check">✓</span> {f}</li>
                                    ))}
                                </ul>
                                <button className="btn btn-primary membership-cta" style={{ width: '100%' }}>Elegir Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Locations ─── */}
            <section className="section" id="sedes">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Nuestras <span className="gradient-text">Sedes</span></h2>
                        <p className="section-subtitle">3 ubicaciones estratégicas para que entrenes cerca de ti</p>
                    </div>
                    <div className="locations-grid">
                        {LOCATIONS.map((loc) => (
                            <div key={loc.id} className="location-card card">
                                <div className="location-image-placeholder">
                                    <img src={loc.image} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div className="location-info">
                                    <h3 className="location-name">{loc.name}</h3>
                                    <p className="location-address">📍 {loc.address}</p>
                                    <p className="location-phone">📞 {loc.phone}</p>
                                    <p className="location-hours">🕐 {loc.hours}</p>
                                    <div className="location-services">
                                        {loc.services.map((s, j) => (
                                            <span key={j} className="badge badge-primary">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Products Section ─── */}
            {/*<section className="section section-dark" id="productos">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Nuestros <span className="gradient-text">Productos</span></h2>
                        <p className="section-subtitle">Suplementos y accesorios para complementar tu entrenamiento</p>
                    </div>
                    <div className="products-grid">
                        {[
                            { icon: '🥤', name: 'Proteína Whey', price: 'S/ 120', category: 'Suplemento' },
                            { icon: '💊', name: 'Pre-Workout', price: 'S/ 85', category: 'Suplemento' },
                            { icon: '🧤', name: 'Guantes Gym', price: 'S/ 35', category: 'Accesorio' },
                            { icon: '💧', name: 'Botella Deportiva', price: 'S/ 25', category: 'Accesorio' },
                            { icon: '🎒', name: 'Mochila Gym', price: 'S/ 65', category: 'Accesorio' },
                            { icon: '🩳', name: 'Ropa Deportiva', price: 'Desde S/ 45', category: 'Ropa' }
                        ].map((p, i) => (
                            <div key={i} className="product-card card">
                                <div className="product-icon">{p.icon}</div>
                                <span className="badge badge-primary product-category">{p.category}</span>
                                <h4 className="product-name">{p.name}</h4>
                                <p className="product-price">{p.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Contact Section ─── */}
            <section className="section" id="contacto">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Contá<span className="gradient-text">ctanos</span></h2>
                        <p className="section-subtitle">¿Tienes preguntas? Estamos aquí para ayudarte</p>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
                                <div>
                                    <h4>Email</h4>
                                    <p>info@rafagym.com</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <div>
                                    <h4>Teléfono</h4>
                                    <p>+51 987 654 321</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">💬</span>
                                <div>
                                    <h4>WhatsApp</h4>
                                    <p>+51 987 654 321</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">🕐</span>
                                <div>
                                    <h4>Horario de Atención</h4>
                                    <p>Lun - Sab: 5:00am - 10:00pm</p>
                                </div>
                            </div>
                        </div>
                        <form className="contact-form card" onSubmit={e => e.preventDefault()}>
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input className="form-input" placeholder="Tu nombre completo" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" placeholder="tu@email.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mensaje</label>
                                <textarea className="form-input" rows={4} placeholder="¿En qué podemos ayudarte?" style={{ resize: 'vertical' }} />
                            </div>
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>Enviar Mensaje</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}
