import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';

export default function FAQSection() {
  const faqItems = [
    {
      q: 'Apakah dokumen yang saya unggah aman?',
      a: 'Ya, keamanan Anda adalah prioritas utama. Dokumen dienkripsi secara end-to-end saat diproses oleh sistem AI, dan kami tidak menyimpan dokumen Anda ke dalam basis data publik.'
    },
    {
      q: 'Bagaimana kecerdasan buatan membaca dokumen Indonesia?',
      a: 'Kami menggunakan Gemini, model AI terbaru dari Google yang dilatih dengan terminologi hukum Indonesia serta peraturan perundang-undangan nasional.'
    },
    {
      q: 'Apakah hasilnya dapat digunakan sebagai nasihat hukum resmi?',
      a: 'Tidak. SuaraHukum adalah alat bantu edukasi berbasis kecerdasan buatan, bukan penasihat hukum resmi atau advokat berizin. Hasil analisis bersifat informatif untuk membantu Anda memahami isi dokumen. Untuk tindakan hukum formal berisiko tinggi, tetap disarankan berkonsultasi dengan advokat profesional.'
    },
    {
      q: 'Dokumen berformat apa saja yang didukung?',
      a: 'Saat ini kami mendukung berbagai format gambar (berupa foto kamera langsung atau unggahan berkas) seperti JPG, JPEG, PNG, dan WEBP.'
    },
    {
      q: 'Bagaimana jika dokumen tidak terbaca oleh AI?',
      a: 'Pastikan foto dokumen diambil dengan pencahayaan yang terang, fokus tajam, dan seluruh paragraf terlihat jelas. Fitur crop bawaan kami juga dapat Anda gunakan untuk membuang background yang tidak perlu.'
    }
  ];

  return (
    <section id="faq" className="w-full py-24 px-6 lg:px-12 bg-white relative z-30 transition-colors">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase text-[var(--gold)] font-bold tracking-widest">
            FAQ
          </span>
          <h2 className="font-display font-black text-3xl md:text-5xl mt-3 text-[var(--navy-deep)]">
            Pertanyaan yang Sering Diajukan
          </h2>
        </motion.div>

        <Accordion className="w-full max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-[var(--cream)] rounded-xl px-6 border-none mb-4 shadow-sm py-2"
            >
              <AccordionTrigger className="text-lg font-bold text-[var(--navy-deep)] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--ink-mid)] text-[15px] leading-relaxed pt-2 pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
