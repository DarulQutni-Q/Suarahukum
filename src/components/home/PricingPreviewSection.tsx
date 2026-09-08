import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Zap, Infinity as InfinityIcon } from 'lucide-react';

interface PricingPreviewSectionProps {
  onSelectPlan: () => void;
}

export default function PricingPreviewSection({ onSelectPlan }: PricingPreviewSectionProps) {
  return (
    <section
      id="harga"
      className="w-full py-24 px-6 lg:px-12 bg-[var(--cream)] relative z-30 transition-colors border-t border-[var(--cream-dark)]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">
            PILIHAN PAKET
          </span>
          <h2 className="font-display font-black text-3xl md:text-5xl mt-3 text-[var(--navy-deep)]">
            Transparan. Tanpa Biaya Tersembunyi.
          </h2>
          <p className="text-[var(--ink-mid)] mt-4 max-w-2xl mx-auto text-lg">
            Mulai secara gratis atau dapatkan analisis mendalam dengan harga yang terjangkau.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 flex flex-col transform hover:-translate-y-2 transition-transform border border-[var(--cream-dark)] shadow-sm"
          >
            <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Gratis</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 0</span>
              <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>3 analisis / 24 jam</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Ringkasan singkat dokumen</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>1 foto per analisis</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Riwayat tersimpan 7 hari</span>
              </li>
            </ul>
            <button
              onClick={onSelectPlan}
              className="w-full h-12 rounded-xl font-bold bg-[var(--cream-dark)] text-[var(--navy-deep)] hover:bg-slate-200 transition-colors shadow-sm border border-[var(--cream-dark)]"
            >
              Mulai Sekarang
            </button>
          </motion.div>

          {/* Plus Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-md relative flex flex-col transform md:-translate-y-4 hover:-translate-y-6 transition-transform border-2 border-[var(--gold)]"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1 shadow-md">
              <Star size={14} className="text-white fill-current" /> Paling Diminati
            </div>
            <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Plus</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 29.000</span>
              <span className="text-slate-500 font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>15 analisis / 12 jam</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Analisis mendalam per pasal</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Upload PDF / multi-halaman</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Tanya jawab AI berkelanjutan</span>
              </li>
            </ul>
            <button
              onClick={onSelectPlan}
              className="w-full h-12 rounded-xl font-bold bg-[var(--gold)] text-white hover:bg-[#b07d20] transition-colors shadow-sm active:scale-95"
            >
              Lihat Detail Paket
            </button>
          </motion.div>

          {/* Pro Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 flex flex-col transform hover:-translate-y-2 transition-transform border border-[var(--cream-dark)] shadow-sm"
          >
            <h3 className="font-bold text-2xl text-[var(--navy-deep)] mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-black text-3xl text-[var(--navy-deep)]">Rp 79.000</span>
              <span className="text-[var(--ink-mid)] font-medium">/bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>35 analisis / 12 jam</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <Zap className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Prioritas proses AI ekstra detail</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <CheckCircle2 className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Semua fitur paket Plus</span>
              </li>
              <li className="flex gap-3 text-[var(--ink-mid)]">
                <InfinityIcon className="text-[var(--gold)] shrink-0 mt-0.5" size={20} />
                <span>Riwayat tersimpan selamanya & Ekspor PDF</span>
              </li>
            </ul>
            <button
              onClick={onSelectPlan}
              className="w-full h-12 rounded-xl font-bold border-2 border-[var(--navy-deep)] text-[var(--navy-deep)] hover:bg-[var(--navy-deep)] hover:text-white transition-colors shadow-sm"
            >
              Lihat Detail Paket
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
