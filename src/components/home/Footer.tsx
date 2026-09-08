import React from 'react';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <>
      {/* Decorative Divider */}
      <div className="w-full bg-[var(--navy-deep)] flex justify-center py-8 relative z-20">
        <div className="w-[80%] max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--navy-light)] to-transparent opacity-60"></div>
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 bg-[var(--navy-deep)] rounded-full flex items-center justify-center border border-[var(--navy-light)] opacity-60">
          <div className="w-1 h-1 bg-[var(--gold)] rounded-full text-xs"></div>
        </div>
      </div>

      {/* Tentang Kami Section */}
      <section
        id="tentang-kami"
        className="w-full py-24 px-6 lg:px-12 bg-[var(--navy-deep)] text-white relative z-30 transition-colors"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Scale size={48} className="mx-auto mb-8 text-[var(--gold)] opacity-90" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight text-white/95">
            Mewujudkan Keadilan Bagi Mereka Yang Tidak Mengerti Bahasa Hukum
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium mb-12 px-4 md:px-0">
            Banyak masyarakat menandatangani dokumen yang merugikan mereka setiap harinya karena bahasa kontrak sengaja dibuat rumit. SuaraHukum adalah inisiatif Civic Tech untuk menerjemahkan kebingungan hukum menjadi kesadaran akan hak-hak Anda dengan bantuan kecerdasan buatan.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-sm tracking-widest text-[var(--gold)] font-bold uppercase bg-white/5 px-4 py-2 rounded-md">
              Inisiatif Hukum Terbuka
            </span>
          </div>
        </motion.div>
      </section>

      {/* Bottom Footer */}
      <footer className="bg-gradient-to-b from-[var(--navy-deep)] to-[#0B1524] text-slate-400 py-12 px-6 text-center border-t border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[var(--gold)]" />
            <span className="font-display font-black text-xl text-white tracking-tight">
              SuaraHukum.
            </span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} SuaraHukum. Powered by Advanced AI.
          </p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <a href="#faq" className="hover:text-white transition-colors">
              Pusat Bantuan
            </a>
            <a href="#peraturan" className="hover:text-white transition-colors">
              Dasar Hukum
            </a>
            <a href="mailto:support@suarahukum.id" className="hover:text-white transition-colors">
              Hubungi Kami
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
