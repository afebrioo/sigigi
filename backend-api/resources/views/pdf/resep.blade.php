<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resep Obat - {{ $rekamMedis->pasien->nama_lengkap }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            line-height: 1.4;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .brand-logo {
            font-size: 20px;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }
        .clinic-info {
            text-align: right;
            font-size: 10px;
            color: #4b5563;
        }
        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .meta-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .meta-label {
            font-weight: bold;
            color: #4b5563;
            width: 20%;
        }
        .meta-value {
            color: #111827;
        }
        .prescription-container {
            margin: 20px 0;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            background-color: #fafafa;
        }
        .rx-symbol {
            font-size: 24px;
            font-family: Georgia, serif;
            font-weight: bold;
            color: #1e3a8a;
            float: left;
            margin-right: 15px;
            margin-top: -5px;
        }
        .rx-list {
            margin-left: 35px;
        }
        .rx-item {
            margin-bottom: 15px;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 10px;
        }
        .rx-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }
        .drug-name {
            font-weight: bold;
            font-size: 13px;
        }
        .drug-qty {
            font-style: italic;
            color: #4b5563;
        }
        .drug-dosage {
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 3px;
        }
        .footer {
            margin-top: 50px;
            width: 100%;
        }
        .signature-container {
            float: right;
            width: 40%;
            text-align: center;
        }
        .signature-space {
            height: 70px;
        }
        .doctor-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="brand-logo">SIGIGI</div>
                    <div style="font-size: 9px; color: #4b5563; font-weight: bold;">Dental Care Portal</div>
                </td>
                <td class="clinic-info">
                    @if($klinik)
                        <div style="font-weight: bold; font-size: 11px; color: #1e3a8a;">{{ $klinik->nama_klinik }}</div>
                        <div>{{ $klinik->alamat_klinik }}</div>
                        <div>Telp: {{ $klinik->telepon }}</div>
                    @else
                        <div style="font-weight: bold; font-size: 11px; color: #1e3a8a;">Klinik Sigigi</div>
                        <div>Jl. Capstone Design No. 2026</div>
                        <div>Telp: (021) 12345678</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="title">Copy Resep Dokter</div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Nama Pasien</td>
            <td style="width: 2%">:</td>
            <td class="meta-value">{{ $rekamMedis->pasien->nama_lengkap }}</td>
            <td class="meta-label">Tanggal</td>
            <td style="width: 2%">:</td>
            <td class="meta-value">{{ $rekamMedis->tanggal_kunjungan ? $rekamMedis->tanggal_kunjungan->format('d/m/Y') : '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">No. Rekam Medis</td>
            <td>:</td>
            <td class="meta-value">{{ $rekamMedis->pasien->no_rekam_medis }}</td>
            <td class="meta-label">Dokter</td>
            <td>:</td>
            <td class="meta-value">{{ $dokter ? $dokter->nama_dokter : '-' }}</td>
        </tr>
    </table>

    <div class="prescription-container">
        <div class="rx-symbol">R/</div>
        <div class="rx-list">
            @forelse($prescriptions as $p)
                <div class="rx-item">
                    <table style="width: 100%;">
                        <tr>
                            <td class="drug-name">{{ $p['drugName'] }}</td>
                            <td class="text-right drug-qty">No. {{ $p['quantity'] }} ({{ $p['unit'] ?: 'Unit' }})</td>
                        </tr>
                    </table>
                    <div class="drug-dosage">S. {{ $p['dosage'] }}</div>
                    @if(!empty($p['notes']))
                        <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Catatan: {{ $p['notes'] }}</div>
                    @endif
                </div>
            @empty
                <div style="color: #6b7280; font-style: italic; padding: 10px 0;">Tidak ada resep obat tercatat.</div>
            @endforelse
        </div>
        <div class="clear"></div>
    </div>

    <div class="footer">
        <div class="signature-container">
            <div>{{ $klinik ? ($klinik->alamat_kota ?? 'Bandung') : 'Bandung' }}, {{ date('d M Y') }}</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 5px;">Dokter Gigi,</div>
            <div class="signature-space"></div>
            <div class="doctor-name">{{ $dokter ? $dokter->nama_dokter : 'Dokter Gigi' }}</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 2px;">NIP/SIP: {{ $rekamMedis->dokterKlinik ? $rekamMedis->dokterKlinik->no_sip : '-' }}</div>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>
