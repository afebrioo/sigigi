import os
import json
import google.generativeai as genai

def run_triage(keluhan: str, questionnaire: dict, cnn_prediction: str, cnn_confidence: float, gemini_api_key: str = None) -> dict:
    """
    Menjalankan Late-Fusion Triage Pipeline menggunakan Google Gemini API.
    Menerima keluhan pasien, jawaban kuisioner, dan hasil CNN karies untuk merumuskan
    draf anamnesis klinis formal serta rekomendasi ramah pasien dalam format JSON.
    """
    # Gunakan key dari argument (bisa dipass dari backend Laravel) atau environment variable
    api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY tidak dikonfigurasi. Silakan tambahkan API key.")

    # MOCK MODE SIMULATION: Jika key adalah 'mock'/'test' atau tidak diawali dengan 'AIzaSy' (misal access token Cloud)
    if api_key in ("mock", "test") or not api_key.startswith("AIzaSy"):
        # Ekstrasi gejala sederhana dari teks keluhan untuk membuat simulasi realistis
        lower_complaint = keluhan.lower() if keluhan else ""
        
        trigger = "Spontan"
        if "dingin" in lower_complaint or "es" in lower_complaint:
            trigger = "Rangsangan dingin (termal)"
        elif "panas" in lower_complaint:
            trigger = "Rangsangan panas (termal)"
        elif "makan" in lower_complaint or "kunyah" in lower_complaint:
            trigger = "Tekanan mekanis saat mengunyah"
            
        location = "Tidak spesifik"
        if "geraham" in lower_complaint:
            location = "Gigi geraham (Molar)"
        elif "depan" in lower_complaint:
            location = "Gigi depan (Anterior)"
        elif "bawah" in lower_complaint:
            location = "Regio rahang bawah"
        elif "atas" in lower_complaint:
            location = "Regio rahang atas"

        is_severe = "ngilu" in lower_complaint or "sakit" in lower_complaint or "nyeri" in lower_complaint or "pusing" in lower_complaint
        urgency = "Tinggi" if is_severe else "Sedang"
        score = 8 if is_severe else 5

        # Jika CNN mendeteksi karies, tambahkan ke urgensi
        if cnn_prediction == "karies":
            score = min(10, score + 1)
            if score >= 8:
                urgency = "Tinggi"

        # Buat anamnesis draft
        anamnesis = f"Pasien mengeluhkan ketidaknyamanan berupa rasa sakit pada {location} yang dipicu oleh {trigger}. Status karies citra CNN terdeteksi '{cnn_prediction}'. Disarankan pemeriksaan penunjang intraoral."

        reasoning = f"Pasien mengalami keluhan dental aktif ({trigger}) dikombinasikan dengan deteksi karies CNN '{cnn_prediction}' (tingkat keyakinan {cnn_confidence}%). Menunjukkan indikasi karies aktif yang berpotensi mencapai jaringan pulpa."

        advice = f"Halo Kak! Kami mendeteksi adanya ketidaknyamanan pada gigi Kakak ({location}) yang tampaknya dipicu oleh {trigger.lower()}. Cobalah hindari makanan atau minuman yang terlalu dingin, panas, manis, atau keras untuk sementara waktu ya Kak. Segera buat janji temu langsung dengan dokter gigi di SIGIGI agar lubang atau rasa ngilunya bisa ditangani sebelum bertambah parah!"
        
        post_treatment_advice = f"Halo Kak! Kami mendeteksi adanya riwayat ketidaknyamanan pada gigi Kakak ({location}) yang dipicu oleh {trigger.lower()}. Bagus sekali Kakak sudah melakukan tindakan perawatan langsung dengan dokter gigi kami di SIGIGI! Untuk menjaga kesehatan gigi yang baru dirawat, pastikan untuk menghindari makanan atau minuman yang terlalu panas, dingin, manis, atau keras terlebih dahulu, serta rutin sikat gigi dua kali sehari ya Kak!"

        return {
            "extracted_symptoms": {
                "pain_trigger": trigger,
                "duration_days": 3 if is_severe else None,
                "location": location
            },
            "anamnesis_draft": anamnesis,
            "urgency_level": urgency,
            "urgency_score": score,
            "clinical_reasoning": reasoning,
            "patient_friendly_advice": advice,
            "post_treatment_advice": post_treatment_advice
        }

    genai.configure(api_key=api_key)

    # Format kuesioner ke string yang mudah dibaca model
    questionnaire_items = []
    questions_map = {
        "q1": "Nyeri gigi secara terus-menerus > 2 hari",
        "q2": "Gigi berlubang terasa sangat sakit saat makan/minum",
        "q3": "Pembengkakan area rahang/wajah",
        "q4": "Sulit tidur akibat rasa sakit",
        "q5": "Gusi berdarah secara spontan",
        "q6": "Kesulitan membuka mulut secara normal",
        "q7": "Gigi terasa goyang/tidak stabil",
        "q8": "Nyeri/tidak nyaman saat mengunyah",
        "q9": "Demam disertai rasa sakit gigi/gusi",
        "q10": "Cedera/benturan pada gigi/rahang baru-baru ini"
    }

    for key, val in questionnaire.items():
        if key in questions_map:
            questionnaire_items.append(f"- {questions_map[key]}: {val}")
    
    questionnaire_str = "\n".join(questionnaire_items) if questionnaire_items else "- Tidak ada jawaban kuesioner."

    prompt = f"""
Anda adalah sistem kecerdasan buatan medis gigi (Dental AI Assistant) profesional untuk klinik SIGIGI.
Tugas Anda adalah melakukan analisis anamnesis medis dan triage (prioritas antrian) berdasarkan data pasien berikut:

1. Keluhan Utama Pasien (informal/bahasa sehari-hari):
"{keluhan or 'Tidak ada deskripsi keluhan tambahan.'}"

2. Hasil Kuesioner Keluhan Gigi (10 Pertanyaan):
{questionnaire_str}

3. Hasil Deteksi Karies berbasis Citra (CNN Model):
- Status Karies: {cnn_prediction}
- Tingkat Keyakinan (Confidence): {cnn_confidence}%

Berdasarkan data di atas, lakukan analisis late-fusion secara komprehensif dan hasilkan output JSON dengan struktur berikut secara presisi:
{{
  "extracted_symptoms": {{
    "pain_trigger": "Faktor pemicu rasa sakit (misalnya: air dingin, manis, tekanan kunyah, spontan, dll)",
    "duration_days": "Perkiraan durasi rasa sakit dalam hari (angka integer, jika tidak terdeteksi isi null)",
    "location": "Lokasi spesifik gigi yang dikeluhkan pasien (misalnya: geraham bawah kanan, depan atas, dll)"
  }},
  "anamnesis_draft": "Draf anamnesis formal medis berbahasa Indonesia menggunakan istilah klinis kedokteran gigi yang rapi, padat, dan jelas untuk dibaca oleh dokter (misalnya menggunakan istilah pulpitis akut, karies dentin, gingivitis, dll).",
  "urgency_level": "Tingkat prioritas antrian. Harus salah satu dari nilai berikut: 'Tinggi', 'Sedang', atau 'Rendah'.",
  "urgency_score": "Skor prioritas dalam rentang integer 0 sampai 10. (0 = sangat tidak mendesak, 10 = gawat darurat gigi). Berikan skor tinggi jika ada nyeri spontan terus menerus, pembengkakan wajah, demam akibat infeksi gigi, atau karies parah.",
  "clinical_reasoning": "Penjelasan logis klinis singkat mengapa tingkat prioritas tersebut dipilih, menggabungkan keluhan pasien, jawaban kuesioner, dan hasil scan citra karies CNN.",
  "patient_friendly_advice": "Rekomendasi, tips perawatan sementara secara ramah dan menenangkan bagi pasien. Gunakan sapaan hangat seperti 'Halo Kak!', hindari istilah medis yang menakutkan, jelaskan apa yang sebaiknya dihindari (misal makanan dingin/manis) dan anjurkan untuk segera diperiksa dokter gigi agar lubangnya tidak bertambah dalam.",
  "post_treatment_advice": "Rekomendasi perawatan mandiri pasca-tindakan medis di rumah secara ramah (misalnya menghindari makanan panas/keras setelah tindakan, berkumur dengan air hangat, cara menjaga kebersihan gigi, dll) yang disesuaikan dengan keluhan awal. Gunakan sapaan hangat 'Halo Kak!' dan pastikan sama sekali TIDAK ADA ajakan untuk membuat janji temu baru atau datang ke klinik, karena tindakan perawatan telah selesai dilakukan."
}}
"""

    model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
    response = model.generate_content(prompt)
    
    # Parse hasil JSON dari LLM
    try:
        result = json.loads(response.text)
        return result
    except Exception as e:
        # Fallback jika parsing gagal
        return {
            "extracted_symptoms": {
                "pain_trigger": "Tidak terdeteksi",
                "duration_days": None,
                "location": "Tidak terdeteksi"
            },
            "anamnesis_draft": f"Pasien mengeluhkan keluhan utama: {keluhan}.",
            "urgency_level": "Sedang",
            "urgency_score": 5,
            "clinical_reasoning": f"Gagal memproses JSON LLM: {str(e)}",
            "patient_friendly_advice": "Halo Kak! Keluhan Anda sudah kami catat. Silakan berkonsultasi langsung dengan dokter gigi kami untuk pemeriksaan lebih lanjut.",
            "post_treatment_advice": "Halo Kak! Terima kasih sudah melakukan perawatan di SIGIGI. Jaga kebersihan gigi Anda dengan menyikat gigi secara rutin 2 kali sehari dan hindari makanan keras sementara waktu ya Kak."
        }
