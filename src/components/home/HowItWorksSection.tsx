import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      title: 'Foto atau Unggah Dokumen',
      desc: 'Ambil foto kontrak dengan kamera HP Anda atau unggah file PDF yang sudah ada. Privasi terjamin.'
    },
    {
      num: '2',
      title: 'AI Menganalisis Detail',
      desc: 'Pemrosesan canggih membaca setiap pasal dan mencocokkannya dengan perundang-undangan RI terbaru.'
    },
    {
      num: '3',
      title: 'Pahami Dalam Bahasa Anda',
      desc: 'Dapatkan laporan yang disusun dalam bahasa sehari-hari. Pahami risiko dan hak Anda seketika.'
    }
  ];

  return (
    <section className="w-full py-16 lg:py-24 bg-[var(--cream)] relative z-10 border-b border-[var(--cream-dark)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">
            CARA KERJA SUARAHUKUM
          </span>
          <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)]">
            Tiga Langkah Menuju Kepastian Hukum
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-slate-200 z-0"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center px-4"
            >
              <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center text-3xl font-black text-[var(--navy-deep)] border-[3px] border-[var(--gold)] shadow-md mb-6 outline outline-4 outline-slate-50">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-[var(--navy-deep)] mb-3">{step.title}</h3>
              <p className="text-[var(--ink-mid)] leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
