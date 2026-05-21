import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Reveal, PageTransition, EASE_LUXURY } from "@/components/motion/Animations";
import { toast } from "sonner";
import slide3 from "@/assets/slide3.jpg";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(tL("Veuillez remplir tous les champs obligatoires.", "Please fill in all required fields.", "Por favor, complete todos los campos obligatorios."));
      return;
    }

    setLoading(true);
    // Simulate premium message submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        tL(
          "Votre message a été envoyé avec succès. Notre équipe vous contactera dans les plus brefs délais.",
          "Your message has been sent successfully. Our team will contact you shortly.",
          "Su mensaje ha sido enviado con éxito. Nuestro equipo se pondrá en contacto con usted en breve."
        )
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAF8F3] text-[#0A0A0A]">
        <Helmet>
          <title>{tL("Contactez-nous — Live In Marrakech", "Contact Us — Live In Marrakech", "Contáctenos — Live In Marrakech")}</title>
          <meta
            name="description"
            content={
              tL(
                "Contactez l'agence immobilière Live In Marrakech. Nos experts sont à votre disposition pour vous accompagner.",
                "Contact the Live In Marrakech real estate agency. Our experts are ready to assist you.",
                "Contacte con la agencia inmobiliaria Live In Marrakech. Nuestros expertos están a su disposición para acompañarle."
              )
            }
          />
        </Helmet>

        <Header />

        {/* ─── Hero Section with real local Riad asset ──────────────────── */}
        <section className="relative h-[50vh] md:h-[60vh] bg-black overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={slide3}
              alt="Marrakech Riad Courtyard"
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 text-center px-6">
            <motion.p
              className="text-white/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans font-light mb-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_LUXURY }}
            >
              {tL("ENTRER EN CONTACT", "GET IN TOUCH", "PONERSE EN CONTACTO")}
            </motion.p>
            <motion.h1
              className="text-white font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.02em] leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_LUXURY }}
            >
              {t("nav.contact")}
            </motion.h1>
          </div>
        </section>

        {/* ─── Main Content ────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
              
              {/* Left Column — Contact Information (5 cols) */}
              <div className="lg:col-span-5 space-y-12">
                <Reveal>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans block mb-3">
                    {tL("COORDONNÉES", "CONTACT DETAILS", "DATOS DE CONTACTO")}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-light mb-6">
                    {tL("Nous aimerions avoir de vos nouvelles.", "We would love to hear from you.", "Nos encantaría saber de usted.")}
                  </h2>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {tL(
                      "Que vous recherchiez un Riad historique dans la Médina, une villa contemporaine à Amelkis, ou que vous souhaitiez simplement discuter de gestion locative, nos conseillers sont à votre écoute.",
                      "Whether you're searching for a historic Riad in the Medina, a contemporary villa in Amelkis, or simply wish to discuss property management in Marrakech, our advisors are here.",
                      "Tanto si busca un Riad histórico en la Medina, una villa contemporánea en Amelkis, o simplemente desea hablar de gestión de propiedades en Marrakech, nuestros asesores están aquí."
                    )}
                  </p>
                </Reveal>

                {/* Direct info cards */}
                <div className="space-y-6">
                  <Reveal delay={0.1}>
                    <div className="flex items-start gap-5 p-5 bg-white border border-[#0A0A0A]/5 rounded-sm">
                      <div className="w-11 h-11 shrink-0 border border-[#0A0A0A]/10 flex items-center justify-center bg-[#FAF8F3]">
                        <MapPin size={18} strokeWidth={1.25} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base mb-1">{tL("Notre Adresse", "Our Address", "Nuestra Dirección")}</h4>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed">
                          {t("footer.adresse")}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.2}>
                    <div className="flex items-start gap-5 p-5 bg-white border border-[#0A0A0A]/5 rounded-sm">
                      <div className="w-11 h-11 shrink-0 border border-[#0A0A0A]/10 flex items-center justify-center bg-[#FAF8F3]">
                        <Phone size={18} strokeWidth={1.25} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base mb-1">{tL("Téléphone & WhatsApp", "Phone & WhatsApp", "Teléfono & WhatsApp")}</h4>
                        <a
                          href="tel:+212605387041"
                          className="block text-[#0A0A0A] hover:underline text-sm font-light leading-relaxed"
                        >
                          +212 6 05 38 70 41
                        </a>
                        <a
                          href="https://wa.me/212605387041"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline text-xs tracking-wider uppercase font-medium mt-1 font-sans"
                        >
                          <span>{tL("Discussion instantanée", "Instant Chat", "Chat Instantáneo")}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </a>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.3}>
                    <div className="flex items-start gap-5 p-5 bg-white border border-[#0A0A0A]/5 rounded-sm">
                      <div className="w-11 h-11 shrink-0 border border-[#0A0A0A]/10 flex items-center justify-center bg-[#FAF8F3]">
                        <Mail size={18} strokeWidth={1.25} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base mb-1">{tL("Adresse E-mail", "Email Address", "Dirección de Correo")}</h4>
                        <a
                          href="mailto:contact@liveinmarrakech.com"
                          className="block text-[#0A0A0A] hover:underline text-sm font-light leading-relaxed"
                        >
                          contact@liveinmarrakech.com
                        </a>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>

              {/* Right Column — Contact Form (7 cols) */}
              <div className="lg:col-span-7 bg-white p-8 md:p-12 border border-[#0A0A0A]/5 shadow-sm rounded-sm">
                <Reveal delay={0.1}>
                  {submitted ? (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-16 h-16 bg-[#FAF8F3] border border-emerald-500/20 text-emerald-600 flex items-center justify-center rounded-full mx-auto">
                        <CheckCircle2 size={32} strokeWidth={1.25} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl">
                          {tL("Merci beaucoup !", "Thank you!", "¡Muchas gracias!")}
                        </h3>
                        <p className="text-muted-foreground text-sm font-light max-w-sm mx-auto leading-relaxed">
                          {tL(
                            "Votre demande a bien été reçue. Un de nos conseillers privés vous contactera dans les plus brefs délais.",
                            "Your inquiry has been received. One of our private advisors will get back to you shortly.",
                            "Su solicitud ha sido recibida. Uno de nuestros asesores privados se pondrá en contacto con usted en breve."
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="inline-block border border-[#0A0A0A] px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-sans font-medium hover:bg-[#0A0A0A] hover:text-white transition-all duration-300"
                      >
                        {tL("Envoyer un autre message", "Send another message", "Enviar otro mensaje")}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] tracking-widest uppercase font-sans font-medium text-muted-foreground">
                            {tL("Votre Nom *", "Your Name *", "Su Nombre *")}
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={tL("Ex: Jean Dupont", "John Doe", "Ej: Juan Pérez")}
                            className="w-full h-12 px-4 bg-[#FAF8F3] border border-[#0A0A0A]/10 text-sm font-sans font-light focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                          />
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] tracking-widest uppercase font-sans font-medium text-muted-foreground">
                            {tL("Numéro de Téléphone", "Phone Number", "Número de Teléfono")}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. +33 6..."
                            className="w-full h-12 px-4 bg-[#FAF8F3] border border-[#0A0A0A]/10 text-sm font-sans font-light focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase font-sans font-medium text-muted-foreground">
                          {tL("Adresse E-mail *", "Email Address *", "Dirección de Correo *")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                          className="w-full h-12 px-4 bg-[#FAF8F3] border border-[#0A0A0A]/10 text-sm font-sans font-light focus:outline-none focus:border-[#0A0A0A]/30 transition-colors"
                        />
                      </div>

                      {/* Message Input */}
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-widest uppercase font-sans font-medium text-muted-foreground">
                          {tL("Votre Message *", "Your Message *", "Su Mensaje *")}
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={tL(
                            "Décrivez-nous votre projet immobilier...",
                            "Tell us about your real estate plans...",
                            "Cuéntenos sobre sus planes inmobiliarios..."
                          )}
                          className="w-full p-4 bg-[#FAF8F3] border border-[#0A0A0A]/10 text-sm font-sans font-light focus:outline-none focus:border-[#0A0A0A]/30 transition-colors resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#0A0A0A] text-white flex items-center justify-center gap-2
                          text-[10px] tracking-[0.2em] uppercase font-sans font-medium
                          hover:bg-[#0A0A0A]/85 disabled:opacity-50 transition-colors"
                      >
                        {loading ? (
                          <span>{tL("Envoi en cours...", "Sending...", "Enviando...")}</span>
                        ) : (
                          <>
                            <span>{tL("Envoyer le Message", "Send Message", "Enviar Mensaje")}</span>
                            <Send size={12} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </Reveal>
              </div>

            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
