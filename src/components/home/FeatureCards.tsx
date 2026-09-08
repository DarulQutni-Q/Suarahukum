import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface FeatureCardsProps {
  onStartAnalysis: () => void;
}

export default function FeatureCards({ onStartAnalysis }: FeatureCardsProps) {
  const services = [
    { icon: '💼', title: 'Kontrak Kerja / PKWT', desc: 'Periksa ketentuan gaji, jam kerja, pesangon, dan tahan ijazah sebelum tanda tangan.' },
    { icon: '🔑', title: 'Perjanjian Sewa Menyewa', desc: 'Pastikan hak Anda atas perbaikan bangunan, penahanan uang jaminan (deposit), dan pembatalan sewa.' },
    { icon: '💰', title: 'Surat Perjanjian Hutang', desc: 'Validasi besaran bunga, denda keterlambatan yang wajar, dan penyitaan jaminan/agunan.' },
    { icon: '🏡', title: 'Sertifikat & Jual Beli Tanah', desc: 'Identifikasi potensi sengketa dan keabsahan balik nama di hadapan notaris.' },
    { icon: '🤝', title: 'Perjanjian Kemitraan Bisnis', desc: 'Pahami skema pembagian keuntungan dan tanggung jawab utang piutang usaha (PT/CV).' },
    { icon: '💍', title: 'Perjanjian Pra-Nikah', desc: 'Lindungi keamanan finansial terkait utang bawaan dan pembagian harta gana-gini.' }
  ];

  return (
    <>
      {/* Layanan Section */}
      <section id="layanan" className="w-full py-16 lg:py-24 px-5 lg:px-12 bg-white relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">
              LAYANAN KAMI
            </span>
            <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)]">
              Dokumen Apa Saja Yang Bisa Dianalisis?
            </h2>
            <p className="text-[var(--ink-mid)] mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg">
              SuaraHukum dirancang untuk mengenali dan memberikan saran hukum untuk puluhan jenis dokumen perjanjian sehari-hari.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {services.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4, borderColor: '#cbd5e1' }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[var(--cream-dark)] shadow-sm rounded-xl p-6 md:p-8 cursor-pointer hover:shadow-md"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--cream)] mb-4 md:mb-6 rounded-lg border border-white flex items-center justify-center text-2xl md:text-3xl">
                  {item.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--navy-deep)] mb-2 md:mb-3">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--ink-mid)] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Peraturan Section */}
      <section id="peraturan" className="w-full py-24 px-6 lg:px-12 bg-white relative z-20 overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="aspect-square bg-[var(--cream)] rounded-3xl p-8 relative max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-[var(--navy-deep)] rounded-3xl transform rotate-3 scale-[0.98] -z-10"></div>
              <div className="bg-white w-full h-full rounded-2xl shadow-sm border border-[var(--cream-dark)] p-6 md:p-8 flex flex-col">
                <div className="w-16 h-2 bg-[var(--gold)] mb-6"></div>
                <h3 className="font-display font-black text-2xl md:text-3xl text-[var(--navy-deep)] mb-4">
                  Dasar Hukum Acuan AI
                </h3>
                <div className="space-y-4 font-mono text-xs md:text-sm overflow-y-auto">
                  <div className="pb-4 border-b border-[var(--cream-dark)]">
                    ➢ Kitab Undang-Undang Hukum Perdata (KUHPerdata) Buku III
                  </div>
                  <div className="pb-4 border-b border-[var(--cream-dark)]">
                    ➢ Undang-Undang No. 13 Tahun 2003 tentang Ketenagakerjaan
                  </div>
                  <div className="pb-4 border-b border-[var(--cream-dark)]">
                    ➢ Undang-Undang No. 6 Tahun 2023 (Cipta Kerja)
                  </div>
                  <div className="pb-4 border-b border-[var(--cream-dark)]">
                    ➢ Undang-Undang No. 5 Tahun 1960 (UUPA)
                  </div>
                  <div className="pb-4">
                    ➢ Peraturan Menteri Ketenagakerjaan Terkini
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <span className="mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">
              AKURASI HUKUM
            </span>
            <h2 className="font-display font-black text-3xl md:text-4xl mt-3 text-[var(--navy-deep)] leading-tight mb-6">
              Analisis Selalu Disesuaikan dengan Peraturan Nasional Terkini
            </h2>
            <p className="text-[var(--ink-mid)] mb-8 text-lg leading-relaxed">
              Sistem kecerdasan buatan kami dilatih menggunakan standar hukum yang berlaku di Indonesia. AI akan membandingkan setiap pasal dalam dokumen Anda terhadap perlindungan minimal yang diwajibkan oleh undang-undang.
            </p>
            <button
              onClick={onStartAnalysis}
              className="h-14 px-8 bg-[var(--navy-deep)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--navy-mid)] transition-colors inline-flex active:scale-95 shadow-md"
            >
              <span>Coba Analisis Berkas Anda</span>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
