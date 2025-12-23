const catalog = {
  categories: [
    { id: 'cat_1_pariya', title: 'Kaş + Kirpik + Cilt Bakım (Pariya)' },
    { id: 'cat_2_fatma', title: 'Kaş Hizmetleri (Fatma)' },
    { id: 'cat_3_waxing', title: 'Ağda – Waxing' },
    { id: 'cat_4_nails', title: 'El - Ayak – Manikür & Pedikür' },
    { id: 'cat_5_hair_color', title: 'Saç Boya + Kesim + Fön' },
    { id: 'cat_6_hair_care', title: 'Saç Bakım + Şekillendirme' },
    { id: 'cat_7_permanent_makeup', title: 'Kalıcı Makyaj + Kaş & Kirpik' },
    { id: 'cat_8_bridal', title: 'Saç Topuz + Makyaj' }
  ],

  services: [
    // 🟢 1) Pariya
    { id: 'kas_vip', name: 'Kaş VIP', duration: 30, price: 500, categoryId: 'cat_1_pariya' },
    { id: 'kas_biyik_cene_vip', name: 'Kaş + Bıyık + Çene VIP', duration: 30, price: 600, categoryId: 'cat_1_pariya' },
    { id: 'kas_yuz_iple_vip', name: 'Kaş + Yüz (İple) VIP', duration: 60, price: 900, categoryId: 'cat_1_pariya' },
    { id: 'yuz_agda_vip', name: 'Yüz Ağda VIP', duration: 30, price: 500, categoryId: 'cat_1_pariya' },
    { id: 'yuz_iple_vip', name: 'Yüz İple VIP', duration: 30, price: 600, categoryId: 'cat_1_pariya' },
    { id: 'kas_altin_oran', name: 'Kaş Altın Oran', duration: 25, price: 500, categoryId: 'cat_1_pariya' },
    { id: 'kas_laminasyon', name: 'Kaş Laminasyonu', duration: 45, price: 750, categoryId: 'cat_1_pariya' },
    { id: 'kirpik_lifting', name: 'Kirpik Lifting', duration: 60, price: 750, categoryId: 'cat_1_pariya' },
    { id: 'cilt_klasik', name: 'Cilt Bakım Klasik', duration: 60, price: 1000, categoryId: 'cat_1_pariya' },
    { id: 'cilt_leke', name: 'Cilt Bakım Leke Tedavi', duration: 90, price: 1500, categoryId: 'cat_1_pariya' },

    // 🟢 2) Fatma
    { id: 'kas', name: 'Kaş', duration: 15, price: 200, categoryId: 'cat_2_fatma' },
    { id: 'kas_biyik', name: 'Kaş + Bıyık', duration: 30, price: 300, categoryId: 'cat_2_fatma' },
    { id: 'kas_yuz_agda', name: 'Kaş + Yüz Ağda', duration: 30, price: 450, categoryId: 'cat_2_fatma' },
    { id: 'kas_yuz_iple', name: 'Kaş + Yüz (İple)', duration: 45, price: 600, categoryId: 'cat_2_fatma' },
    { id: 'yuz_iple', name: 'Yüz (İple)', duration: 30, price: 400, categoryId: 'cat_2_fatma' },
    { id: 'yuz_agda', name: 'Yüz Ağda', duration: 20, price: 350, categoryId: 'cat_2_fatma' },

    // 🟢 3) Ağda
    { id: 'tum_vucut', name: 'Tüm Vücut Ağda', duration: 60, price: 2000, categoryId: 'cat_3_waxing' },
    { id: 'komple_1', name: 'Komple Ağda 1', duration: 30, price: 1000, categoryId: 'cat_3_waxing' },
    { id: 'komple_2', name: 'Komple Ağda 2', duration: 50, price: 1300, categoryId: 'cat_3_waxing' },
    { id: 'bikini', name: 'Bikini', duration: 15, price: 400, categoryId: 'cat_3_waxing' },
    { id: 'tum_kol', name: 'Tüm Kol', duration: 30, price: 350, categoryId: 'cat_3_waxing' },
    { id: 'yarim_kol', name: 'Yarım Kol', duration: 20, price: 300, categoryId: 'cat_3_waxing' },
    { id: 'tum_bacak', name: 'Tüm Bacak', duration: 30, price: 500, categoryId: 'cat_3_waxing' },
    { id: 'yarim_bacak', name: 'Yarım Bacak', duration: 20, price: 350, categoryId: 'cat_3_waxing' },

    // 🟢 4) Nails
    { id: 'manikur', name: 'Manikür', duration: 30, price: 400, categoryId: 'cat_4_nails' },
    { id: 'pedikur', name: 'Pedikür', duration: 30, price: 600, categoryId: 'cat_4_nails' },
    { id: 'manikur_pedikur', name: 'Manikür + Pedikür', duration: 90, price: 800, categoryId: 'cat_4_nails' },

    // 🟢 5) Hair Color
    { id: 'dip_boya', name: 'Dip Boya', duration: 75, price: 700, categoryId: 'cat_5_hair_color' },
    { id: 'komple_boya', name: 'Komple Boya', duration: 90, price: 1500, categoryId: 'cat_5_hair_color' },
    { id: 'sac_kesim', name: 'Saç Kesim', duration: 45, price: 500, categoryId: 'cat_5_hair_color' },

    // 🟢 6) Hair Care
    { id: 'keratin', name: 'Keratin Bakım', duration: 60, price: 1000, categoryId: 'cat_6_hair_care' },
    { id: 'brezilya_fon', name: 'Brezilya Fönü', duration: 150, price: 3000, categoryId: 'cat_6_hair_care' },

    // 🟢 7) Permanent Makeup
    { id: 'mikroblading', name: 'Mikroblading', duration: 150, price: 6000, categoryId: 'cat_7_permanent_makeup' },
    { id: 'dipliner', name: 'Dipliner', duration: 90, price: 2500, categoryId: 'cat_7_permanent_makeup' },

    // 🟢 8) Bridal
    { id: 'gelin_basi', name: 'Gelin Başı', duration: 90, price: 5000, categoryId: 'cat_8_bridal' },
    { id: 'makyaj_gunluk', name: 'Makyaj Günlük', duration: 30, price: 800, categoryId: 'cat_8_bridal' }
  ]
}

module.exports = catalog
