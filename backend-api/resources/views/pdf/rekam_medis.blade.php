<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekam Medis - {{ $rekamMedis->pasien->nama_lengkap }}</title>
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
            border-bottom: 3px double #1e3a8a;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .brand-logo {
            font-size: 24px;
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
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .meta-label {
            font-weight: bold;
            color: #4b5563;
            width: 25%;
        }
        .meta-value {
            color: #111827;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        .data-table th {
            background-color: #f3f4f6;
            color: #1e3a8a;
            font-weight: bold;
            text-align: left;
            padding: 8px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .data-table td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .text-right {
            text-align: right;
        }
        .total-box {
            float: right;
            width: 35%;
            margin-top: 15px;
            border-collapse: collapse;
        }
        .total-box td {
            padding: 4px 8px;
            font-size: 11px;
        }
        .total-row {
            font-weight: bold;
            color: #1e3a8a;
            border-top: 1px solid #e5e7eb;
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
                    <div style="font-size: 10px; color: #4b5563; font-weight: bold; margin-top: 2px;">Dental Care Portal</div>
                </td>
                <td class="clinic-info">
                    @if($klinik)
                        <div style="font-weight: bold; font-size: 12px; color: #1e3a8a;">{{ $klinik->nama_klinik }}</div>
                        <div>{{ $klinik->alamat_klinik }}</div>
                        <div>Telp: {{ $klinik->telepon }}</div>
                    @else
                        <div style="font-weight: bold; font-size: 12px; color: #1e3a8a;">Klinik Sigigi</div>
                        <div>Jl. Capstone Design No. 2026</div>
                        <div>Telp: (021) 12345678</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="title">Rekam Medis Pasien</div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">No. Rekam Medis</td>
            <td style="width: 2%">:</td>
            <td class="meta-value" style="font-weight: bold;">{{ $rekamMedis->pasien->no_rekam_medis }}</td>
            <td class="meta-label">Tanggal Kunjungan</td>
            <td style="width: 2%">:</td>
            <td class="meta-value">{{ $rekamMedis->tanggal_kunjungan ? $rekamMedis->tanggal_kunjungan->format('d/M/Y H:i') : '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Nama Pasien</td>
            <td>:</td>
            <td class="meta-value">{{ $rekamMedis->pasien->nama_lengkap }}</td>
            <td class="meta-label">Dokter Pemeriksa</td>
            <td>:</td>
            <td class="meta-value">{{ $dokter ? $dokter->nama_dokter : '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Gender / Tgl Lahir</td>
            <td>:</td>
            <td class="meta-value">
                {{ $rekamMedis->pasien->jenis_kelamin == 'L' ? 'Laki-laki' : ($rekamMedis->pasien->jenis_kelamin == 'P' ? 'Perempuan' : '-') }} / 
                {{ $rekamMedis->pasien->tanggal_lahir ? date('d/m/Y', strtotime($rekamMedis->pasien->tanggal_lahir)) : '-' }}
            </td>
            <td class="meta-label">Status Pembayaran</td>
            <td>:</td>
            <td class="meta-value" style="font-weight: bold; color: {{ $rekamMedis->status_pembayaran == 'Sudah Bayar' ? '#10b981' : '#f59e0b' }};">
                {{ $rekamMedis->status_pembayaran }}
            </td>
        </tr>
    </table>

    <div class="section-title">Anamnesa</div>
    <table class="meta-table">
        <tr>
            <td class="meta-label" style="width: 15%;">Keluhan Utama</td>
            <td style="width: 2%">:</td>
            <td class="meta-value">{{ $rekamMedis->keluhan ?: 'Tidak ada keluhan utama.' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Catatan Klinis</td>
            <td>:</td>
            <td class="meta-value">{{ $rekamMedis->catatan_dokter ?: 'Tidak ada catatan klinis tambahan.' }}</td>
        </tr>
    </table>

    <div class="section-title">Tindakan Medis</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 30%">Diagnosa / Penyakit</th>
                <th style="width: 30%">Tindakan</th>
                <th style="width: 10%">Gigi (Posisi)</th>
                <th style="width: 25%">Biaya</th>
            </tr>
        </thead>
        <tbody>
            @php $subtotal = 0; @endphp
            @forelse($treatments as $index => $t)
                @php $subtotal += $t['cost']; @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $t['diseaseName'] }}</td>
                    <td>
                        {{ $t['treatmentName'] }}
                        @if(!empty($t['notes']))
                            <div style="font-size: 9px; color: #6b7280; font-style: italic;">Catatan: {{ $t['notes'] }}</div>
                        @endif
                    </td>
                    <td>{{ $t['toothNumber'] ?: '-' }} {{ $t['position'] ? '(' . $t['position'] . ')' : '' }}</td>
                    <td class="text-right">Rp {{ number_format($t['cost'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #6b7280;">Tidak ada tindakan medis tercatat.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if(count($prescriptions) > 0)
        <div class="section-title">Resep Obat</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 40%">Nama Obat</th>
                    <th style="width: 15%">Jumlah</th>
                    <th style="width: 40%">Aturan Pakai / Catatan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prescriptions as $index => $p)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $p['drugName'] }}</td>
                        <td>{{ $p['quantity'] }} {{ $p['unit'] ?: 'Unit' }}</td>
                        <td>
                            <strong>{{ $p['dosage'] }}</strong>
                            @if(!empty($p['notes']))
                                <span style="font-size: 10px; color: #6b7280; font-style: italic;">({{ $p['notes'] }})</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <table class="total-box">
        <tr>
            <td style="color: #4b5563;">Subtotal:</td>
            <td class="text-right">Rp {{ number_format($subtotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td style="color: #4b5563;">Diskon:</td>
            <td class="text-right">Rp {{ number_format($rekamMedis->diskon ?: 0, 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td>Total Bayar:</td>
            <td class="text-right">Rp {{ number_format(max(0, $subtotal - ($rekamMedis->diskon ?: 0)), 0, ',', '.') }}</td>
        </tr>
    </table>
    <div class="clear"></div>

    <div class="footer">
        <div class="signature-container">
            <div>{{ $klinik ? ($klinik->alamat_kota ?? 'Bandung') : 'Bandung' }}, {{ date('d M Y') }}</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 5px;">Dokter Pemeriksa,</div>
            <div class="signature-space"></div>
            <div class="doctor-name">{{ $dokter ? $dokter->nama_dokter : 'Dokter Gigi' }}</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 2px;">NIP/SIP: {{ $rekamMedis->dokterKlinik ? $rekamMedis->dokterKlinik->no_sip : '-' }}</div>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>
