const fs = require('fs');

const text = `No;Nama;GOL;JABATAN;Pendidikan;TH;Tanggal hari ini;RUANGAN;KELOMPOK JASA;Risk;Jabatan Unit;MK;PD;Jab;RIS;EMG;Total;Rp. MK;Rp. PD;Rp. Jab;Rp. RIS;Rp. EMG; Jaspel Post Remunerasi ;Post Penyesuaian Tambahan beban Kerja; Jaspel Post Remunerasi ; Kelompok Rekap ; Kelompok Pelayanan ; Administrasi 
1;dr. Indah Puspitasari,MARS ;ASN;Direktur;S2;3,89;11/10/2022;Direktur;Direksi;Fisik;direktur;2,25;10;96;0;0;108,25;105.269,13;467.862,81;4.491.483,01;0;0;5.064.615;9.476.790;14.541.405; Direksi ; Direksi ;0,00%
2;dr.Fauziah Andriyani, MARS;ASN;Wakil Direktur Pelayanan Medik dan Keparawatan;S2;16,42;02/04/2010;Wadir Pelayanan;Direksi;Fisik;Wadir;3;10;70;0;0;83;140.358,84;467.862,81;3.275.039,69;0;0;3.883.261;8.160.000;12.043.261; Direksi ; Direksi ;0,00%
3;Bero Utomo, S.Pd., S.Kep.;ASN;Wadir Penunjang dan Pendidikan, Pelatihan dan Penelitian;S1;26,43;01/04/2000;Wadir Penunjang dan DIKLAT;Direksi;Fisik;Wadir;4,5;4;70;0;0;78,5;210.538,27;187.145,13;3.275.039,69;0;0;3.672.723;8.160.000;11.832.723; Direksi ; Direksi ;0,00%
4;Ns.Rahmawati, S.Kep., M.M.;ASN;Wakil Direktur Umum dan Keuangan;S2;26,43;01/04/2000;Wadir Umum dan Keuangan;Direksi;Fisik;Wadir;4,5;10;70;0;0;84,5;210.538,27;467.862,81;3.275.039,69;0;0;3.953.441;8.160.000;12.113.441; Direksi ; Direksi ;0,00%
5;drg. Rochmat Koesbiantoro, M.Kes;ASN;Dewas;;;;Dewas;Direksi;Fisik;Dewas;0;0;0;0;0;;;;;0;0; - ;3.316.877;3.316.877; Direksi ; Direksi ;0,00%
6;M. Yenny Dewi Sitinjak, SE;ASN;Dewas;;;;Dewas;Direksi;Fisik;Dewas;0;0;0;0;0;;;;;0;0; - ;1.895.358;1.895.358; Direksi ; Direksi ;0,00%
7;Syarifah Zahra, SKM, MARS;ASN;Dewas;;;;Dewas;Direksi;Fisik;Dewas;0;0;0;0;0;;;;;0;0; - ;1.895.358;1.895.358; Direksi ; Direksi ;0,00%
8;Hadi Machbudiansyah, S.E., M.M;ASN;Kabid Penunjang Non Medis;S2;31,44;01/04/1995;Kabid Penunjang Non Medik;Struktural;Fisik;Kabag/Kabid;5;10;32;0;0;47;233.931,41;467.862,81;1.497.161,00;0;0;2.198.955; - ;2.198.955; Manajemen ; Struktural ;0,00%
9;dr. Dini Adriyanti;ASN;Kabid Pelayanan Medis;S1;14,42;01/04/2012;Kabid Pelayanan Medik;Struktural;Fisik;Kabag/Kabid;3;4;32;0;0;39;140.358,84;187.145,13;1.497.161,00;0;0;1.824.665; - ;1.824.665; Manajemen ; Struktural ;0,00%
10;Liliek Ani Suryaningsih,S.E.,M.Si;ASN;Kabag Umum dan Kepegawaian;S2;8,34;01/05/2018;Kabag Umum dan Kepegawaian;Struktural;Fisik;Kabag/Kabid;2,55;10;32;0;0;44,55;119.305,02;467.862,81;1.497.161,00;0;0;2.084.329; - ;2.084.329; Manajemen ; Struktural ;0,00%
11;Sopia Lena,S.E.,M.Si;ASN;Kabid Keuangan dan Akuntansi;S2;8,34;01/05/2018;Kabag  Keuangan;Struktural;Fisik;Kabag/Kabid;2,55;10;32;0;0;44,55;119.305,02;467.862,81;1.497.161,00;0;0;2.084.329; - ;2.084.329; Manajemen ; Struktural ;0,00%
12;Sudoto, S.Kom;ASN;Kabag Perencanaan Prog dan Evaluasi;S1;31,44;01/04/1995;Kabag Perencanaan;Struktural;Fisik;Kabag/Kabid;5;4;32;0;0;41;233.931,41;187.145,13;1.497.161,00;0;0;1.918.238; - ;1.918.238; Manajemen ; Struktural ;0,00%
13;dr. Kurniasih, Sp.PD;ASN;Kabid Penunjang Medis;S2;15,43;01/04/2011;Kabid Penunjang Medik;Struktural;Fisik;Kabag/Kabid;3;10;32;0;0;45;140.358,84;467.862,81;1.497.161,00;0;0;2.105.383; - ;2.105.383; Manajemen ; Struktural ;0,00%
14;Dra. Nerliana Isdhianti;ASN;Kabid Pendidikan, Pelatihan dan Penelitian;S1;2,95;21/09/2023;Kabid DIKLAT;Struktural;Fisik;Kabag/Kabid;2;4;32;0;0;38;93.572,56;187.145,13;1.497.161,00;0;0;1.777.879; - ;1.777.879; Manajemen ; Struktural ;0,00%
15;Ns. Eliza Cahyani, S.Kep, M.Kep Jiwa;ASN;Perawat Ahli Muda;S2;26,43;01/04/2000;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Pelaksana;4,5;10;5;0;0;19,5;210.538,27;467.862,81;233.931,41;0;0;912.332; - ;912.332; Keperawatan ; Perawat Non Bangsal ;0,00%
16;Ns.Linda Dwi Novial Fitri, M.Kep.,Sp.Kep J;ASN;Analis Diklat;S2;13,59;01/02/2013;Analis Diklat;Administrasi Penunjang;Fisik;Pelaksana;3;10;5;0;0;18;140.358,84;467.862,81;233.931,41;0;0;842.153; - ;842.153; Penunjang Non Medik ; Administrasi Penunjang ;100,00%
17;Syahrial, A.Md.Kep., S.K.M;ASN;Analis Kebijakan Ahli Muda;S1;33,44;01/04/1993;Analis Kebijakan Ahli Muda;Struktural;Fisik;Pelaksana;5;4;5;0;0;14;233.931,41;187.145,13;233.931,41;0;0;655.008; - ;655.008; Manajemen ; Struktural ;0,00%
18;dr. Yenny, Sp.KJ;ASN;Dokter Ahli muda;S2;9,51;01/03/2017;Psikiater;Psikiater;Fisik;Pelaksana;2,55;10;5;0;0;17,55;119.305,02;467.862,81;233.931,41;0;0;821.099; - ;821.099; Psikiatri ; Psikiater ;0,00%
19;Ns. Sampun,S.Kep;ASN;Perawat Ahli Madya;S1 PROFESI;33,94;01/10/1992;Perawat supervisor;Perawat Non Bangsal;Fisik;Pelaksana;5;4,5;5;0;0;14,5;233.931,41;210.538,27;233.931,41;0;0;678.401; - ;678.401; Keperawatan ; Perawat Non Bangsal ;0,00%
20;Katarina Suko Tri Palupi Hapsari S.Psi.,M.Si;ASN;Psikologi Klinis Madya;S2;29,44;01/04/1997;Klinik Psikologi;Pelayanan Psikologi;Fisik;Pelaksana;4,5;10;5;0;0;19,5;210.538,27;467.862,81;233.931,41;0;0;912.332; - ;912.332; Pelayanan Medik ; Pelayanan Psikologi ;0,00%
21;Ns.Retno Eko Sayekti Arief Saputri, S.Kep.;ASN;Perawat Ahli Madya;S1 PROFESI;26,43;01/04/2000;Perawat supervisor;Perawat Non Bangsal;Fisik;Pelaksana;4,5;4,5;5;0;0;14;210.538,27;210.538,27;233.931,41;0;0;655.008; - ;655.008; Keperawatan ; Perawat Non Bangsal ;0,00%
22;Ns.Enike Kusumawati Ema Ellyana, S.Kep.;ASN;Perawat Ahli Madya;S1 PROFESI;25,43;01/04/2001;Perawat supervisor;Perawat Non Bangsal;Fisik;Pelaksana;4,5;4,5;5;0;0;14;210.538,27;210.538,27;233.931,41;0;0;655.008; - ;655.008; Keperawatan ; Perawat Non Bangsal ;0,00%
23;Ns. Hilda Susanti S.Kep.;ASN;Perawat Ahli Madya;S1 PROFESI;26,43;01/04/2000;Perawat supervisor;Perawat Non Bangsal;Fisik;Pelaksana;4,5;4,5;5;0;0;14;210.538,27;210.538,27;233.931,41;0;0;655.008; - ;655.008; Keperawatan ; Perawat Non Bangsal ;0,00%
24;Laurensia Enny Pantjalina, A.Md.Kep., S.Pd. M.Kes;ASN;Perawat Penyelia;S2;28,44;01/04/1998;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;KOORDINATOR/Katim;4,5;10;6;0;0;20,5;210.538,27;467.862,81;280.717,69;0;0;959.119; - ;959.119; Keperawatan ; Perawat Non Bangsal ;0,00%
25;Isniwati,A.Md.kep;ASN;Perawat Penyelia;D3;34,94;01/10/1991;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Kepala;5;3,75;7;0;0;15,75;233.931,41;175.448,55;327.503,97;0;0;736.884; - ;736.884; Keperawatan ; Perawat Non Bangsal ;0,00%
26;Siti Nurhasenah,A.Md.Kep;ASN;Perawat Penyelia;D3;26,43;01/04/2000;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Pelaksana;4,5;3,75;5;0;0;13,25;210.538,27;175.448,55;233.931,41;0;0;619.918; - ;619.918; Keperawatan ; Perawat Non Bangsal ;0,00%
27;dr.Gusti Reini Megasari;ASN;Dokter Ahli Muda;S1;16,42;03/04/2010;Dokter IGD;Medis;Fisik;Kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Medis ; Medis ;0,00%
28;Nalendra Nugraha, S.Si., Apt.;ASN;Apoteker Ahli Madya;S1;11,51;01/03/2015;Apoteker;Penunjang Farmasi;Fisik;Kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Penunjang Medik ; Penunjang Farmasi ;0,00%
29;Tri Astuti, A.Md.Kep;ASN;Perawat Penyelia;D3;27,44;01/04/1999;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Pelaksana;4,5;3,75;5;0;0;13,25;210.538,27;175.448,55;233.931,41;0;0;619.918; - ;619.918; Keperawatan ; Perawat Non Bangsal ;0,00%
30;Widi Astuti, A.Md.AK. S.Tr.Kes;ASN;Pranata Lakber Penyelia;D4;30,94;01/10/1995;Instalasi Laboratorium;Penunjang Laboratorium;Fisik;Kepala;5;4;7;0;0;16;233.931,41;187.145,13;327.503,97;0;0;748.581; - ;748.581; Penunjang Medik ; Penunjang Laboratorium ;0,00%
31;Ns.Susi Indaryanti, S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;25,43;01/04/2001;Perawat Gelatik;Perawat Gelatik;Fisik;Kepala;4,5;4,5;7;0;0;16;210.538,27;210.538,27;327.503,97;0;0;748.581; - ;748.581; Keperawatan ; Perawat Gelatik ;0,00%
32;Primiaty Anggraeny, A.Md.Kep. S.Pd;ASN;Perawat Penyelia;D3;25,43;01/04/2001;Perawat Cendrawasih;Perawat Cendrawasih;Fisik;KOORDINATOR/Katim;4,5;3,75;6;0;0;14,25;210.538,27;175.448,55;280.717,69;0;0;666.705; - ;666.705; Keperawatan ; Perawat Cendrawasih ;0,00%
33;Irwan,S.K.M;ASN;Sanitarian Ahli Muda;S1;26,43;01/04/2000;Instalasi Kesling;Penunjang Kesling;Fisik;Kepala;4,5;4;7;0;0;15,5;210.538,27;187.145,13;327.503,97;0;0;725.187; - ;725.187; Penunjang Non Medik ; Penunjang Kesling ;0,00%
34;Ns.Budi Rahman, S.Kep;ASN;Perawat Ahli Muda;S1 PROFESI;26,43;01/04/2000;Perawat Elang;Perawat Elang;Fisik;Kepala;4,5;4,5;7;0;0;16;210.538,27;210.538,27;327.503,97;0;0;748.581; - ;748.581; Keperawatan ; Perawat Elang ;0,00%
35;Singgih Nugroho, S.Kes.FT;ASN;Fisioterapis Penyelia;S1;14,59;01/02/2012;Klinik Fisioterapi;Pelayanan Fisioterapi;Fisik;Kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Pelayanan Medik ; Pelayanan Fisioterapi ;0,00%
36;Ns. Masriati S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;9,09;01/08/2017;Perawat Belibis;Perawat Belibis;Fisik;Pelaksana;2,55;4,5;5;0;0;12,05;119.305,02;210.538,27;233.931,41;0;0;563.775; - ;563.775; Keperawatan ; Perawat Belibis ;0,00%
37;Ari Kurniawan, A.Md.Kep;ASN;Perawat Penyelia;D3;30,44;01/04/1996;Perawat Belibis;Perawat Belibis;Fisik;Pelaksana;5;3,75;5;0;0;13,75;233.931,41;175.448,55;233.931,41;0;0;643.311; - ;643.311; Keperawatan ; Perawat Belibis ;0,00%
38;Ns. Hardianto S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;15,43;01/04/2011;Perawat Elang;Perawat Elang;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat Elang ;0,00%
39;Hendri Nopianto , A.Md.Kep.;ASN;Perawat Penyelia;D3;17,43;01/04/2009;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Non Bangsal ;0,00%
40;dr. Eka Yuni Nugrahayu, Sp.KJ.;ASN;Dokter Ahli Muda;S2;15,43;01/04/2011;Psikiater;Psikiater;Fisik;Kepala;3;10;7;0;0;20;140.358,84;467.862,81;327.503,97;0;0;935.726; - ;935.726; Psikiatri ; Psikiater ;0,00%
41;Ns.Rina Herawati, S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;15,43;01/04/2011;Perawat Cendrawasih;Perawat Cendrawasih;Fisik;Kepala;3;4,5;7;0;0;14,5;140.358,84;210.538,27;327.503,97;0;0;678.401; - ;678.401; Keperawatan ; Perawat Cendrawasih ;0,00%
42;Ns.Andi Jumaena , S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;15,43;01/04/2011;Perawat Enggang;Perawat Enggang;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat Enggang ;0,00%
43;Siti Artha Mulianor, A.Md.Kep.;ASN;Perawat Penyelia;D3;16,43;01/04/2010;Perawat Cendrawasih;Perawat Cendrawasih;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Cendrawasih ;0,00%
44;Jauhariyatul Anwariyah, A.Md.Kep.;ASN;Perawat Penyelia;D3;16,43;01/04/2010;Perawat UPIP;Perawat PICU;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat PICU ;0,00%
45;Novitania, A.Md.Kep.;ASN;Perawat Penyelia;D3;16,43;01/04/2010;Perawat Elang;Perawat Elang;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat Elang ;0,00%
46;Nur Wahyuningsih,A.Md.Kes ;ASN;Perawat Gigi Penyelia;D3;30,44;01/04/1996;Pelayanan Bersifat Administrasi;Pelayanan Bersifat Administrasi;Fisik;Pelaksana;5;3,75;5;0;0;13,75;233.931,41;175.448,55;233.931,41;0;0;643.311; - ;643.311; Pelayanan Medik ; Pelayanan Bersifat Administrasi ;50,00%
47;Ns.Tiurmaida Pasaribu, S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;10,42;01/04/2016;Perawat UPIP;Perawat PICU;Fisik;Pelaksana;3;4,5;5;0;0;12,5;140.358,84;210.538,27;233.931,41;0;0;584.829; - ;584.829; Keperawatan ; Perawat PICU ;0,00%
48;Yosep Ari Matia, AMF.;ASN;Fisioterapis Mahir;D3;7,36;22/04/2019;Klinik Fisioterapi;Pelayanan Fisioterapi;Fisik;Pelaksana;2,55;3,75;5;0;0;11,3;119.305,02;175.448,55;233.931,41;0;0;528.685; - ;528.685; Pelayanan Medik ; Pelayanan Fisioterapi ;0,00%
49;Ns.Muri Cahyono Purba, S.Kep.;ASN;Perawat;S2;17,43;01/04/2009;Perawat Non Bangsal;Perawat Non Bangsal;Fisik;Pelaksana;3;10;5;0;0;18;140.358,84;467.862,81;233.931,41;0;0;842.153; - ;842.153; Keperawatan ; Perawat Non Bangsal ;0,00%
50;Ns. Hendi Herdiyan, S.ST.;ASN;Perawat Ahli Pertama;S1;16,43;01/04/2010;Perawat IGD;Perawat IGD;Fisik;Kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Keperawatan ; Perawat IGD ;0,00%
51;Ns. Mahafuddin, S.ST.;ASN;Perawat Ahli Pertama;S1;16,43;01/04/2010;Perawat UPIP;Perawat PICU;Fisik;Kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Manajemen ; Perawat PICU ;0,00%
52;Ns. Nisrina Ulfah, S.Kep;ASN;Perawat Ahli Pertama;S1;16,43;01/04/2010;Perawat Tiung;Perawat Tiung;Fisik;kepala;3;4;7;0;0;14;140.358,84;187.145,13;327.503,97;0;0;655.008; - ;655.008; Keperawatan ; Perawat Tiung ;0,00%
53;Ns. Dodi Hendra, S.Kep.;ASN;Perawat Ahli Pertama;S1 PROFESI;16,43;01/04/2010;Perawat UPIP;Perawat PICU;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat PICU ;0,00%
54;Nurul Hasanah, A.Md.Kes;ASN;Sanitarian Mahir;D3;26,43;01/04/2000;Instalasi Kesling;Penunjang Kesling;Fisik;Pelaksana;4,5;3,75;5;0;0;13,25;210.538,27;175.448,55;233.931,41;0;0;619.918; - ;619.918; Penunjang Non Medik ; Penunjang Kesling ;0,00%
55;Ns. Thoha Ma\`ruf, S.Kep.;ASN;Perawat Ahli Muda;S1 PROFESI;10,42;01/04/2016;Perawat ICU;Perawat ICU;Fisik;Kepala;3;4,5;7;0;0;14,5;140.358,84;210.538,27;327.503,97;0;0;678.401; - ;678.401; Keperawatan ; Perawat ICU ;0,00%
56;Novi Wulandari, A.Md.Kep.;ASN;Perawat Mahir;D3;10,34;01/05/2016;Perawat IGD;Perawat IGD;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat IGD ;0,00%
57;Ruth Deasy Nia Evalinda, A.Md.Kep.;ASN;Perawat Mahir;D3;15,43;01/04/2011;Perawat Tiung;Perawat Tiung;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Tiung ;0,00%
58;M. Firmansyah, A.Md.Kep;ASN;Perawat Mahir;D3;15,43;01/04/2011;Perawat IGD;Perawat IGD;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat IGD ;0,00%
59;Ns.Maria Ulfa, S.Kep.;ASN;Perawat Ahi Pertama;S1 PROFESI;10,42;01/04/2016;Perawat Gelatik;Perawat Gelatik;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat Gelatik ;0,00%
60;Ns. Muliana,S.Kep;ASN;Perawat Ahi Pertama;S1 PROFESI;10,42;01/04/2016;Perawat Belibis;Perawat Belibis;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat Belibis ;0,00%
61;Ns. Dina Ariani S.Kep.;ASN;Perawat Ahli Pertama;S1 PROFESI;15,43;01/04/2011;Perawat Punai;Perawat Punai;Fisik;Kepala;3;4,5;7;0;0;14,5;140.358,84;210.538,27;327.503,97;0;0;678.401; - ;678.401; Keperawatan ; Perawat Punai ;0,00%
62;Ns. Suharsono, S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;12,01;01/09/2014;Perawat Belibis;Perawat Belibis;Fisik;Kepala;3;4,5;7;0;0;14,5;140.358,84;210.538,27;327.503,97;0;0;678.401; - ;678.401; Keperawatan ; Perawat Belibis ;0,00%
63;Henri Netta Ginting, A.Md.;ASN;Teknisi Elekromedis Mahir;D3;15,43;01/04/2011;Elektromedik IPSRS;Penunjang Elektromedik;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Penunjang Non Medik ; Penunjang Elektromedik ;0,00%
64;Alfian Salam Hermani, A.Md.Kep.;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat Cendrawasih;Perawat Cendrawasih;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Cendrawasih ;0,00%
65;Ns. Dian Ismayanti, S.Kep;ASN;Perawat Mahir;S1 PROFESI;14,42;01/04/2012;Perawat Napza;Perawat Napza;Fisik;Kepala;3;4,5;7;0;0;14,5;140.358,84;210.538,27;327.503,97;0;0;678.401; - ;678.401; Keperawatan ; Perawat Napza ;0,00%
66;Syafruddin, A.Md.Kep;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat Elang;Perawat Elang;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Elang ;0,00%
67;Nursoleha, A.Md.Kep.;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat IGD;Perawat IGD;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat IGD ;0,00%
68;Ns. Trisna Junianto S.Kep.;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat Tiung;Perawat Tiung;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat Tiung ;0,00%
69;Indah Dwi Cahyanti A.Md.Kep.;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat IGD;Perawat IGD;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat IGD ;0,00%
70;Citralia Januarty, A.Md.Kep;ASN;Perawat Mahir;D3;14,42;01/04/2012;Ruang Perawatan;Perawat Non Bangsal;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Non Bangsal ;0,00%
71;Ns. Maya Darliana, S.Kep;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat Punai;Perawat Punai;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Punai ;0,00%
72;Dina Riandani,A.Md.Kep;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat Elang;Perawat Elang;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Elang ;0,00%
73;Afriansyah, A.Md.Kep;ASN;Perawat Mahir;D3;15,43;01/04/2011;Perawat UPIP;Perawat PICU;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat PICU ;0,00%
74;Dyan Puspita Wulandari A.Md.Far.;ASN;Asisten Apoteker Mahir;D3;15,43;01/04/2011;Instalasi Farmasi;Penunjang Farmasi;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Penunjang Medik ; Penunjang Farmasi ;0,00%
75;Nurhikmah, S.Gz;ASN;Nutrisionis  Ahli;S1;9,51;01/03/2017;Instalasi Gizi;Pelayanan Gizi;Fisik;Kepala;2,55;4;7;0;0;13,55;119.305,02;187.145,13;327.503,97;0;0;633.954; - ;633.954; Penunjang Non Medik ; Pelayanan Gizi ;0,00%
76;Sugeng Narpodo, S.ST.;ASN;Fisioterapis Ahli Pertama;D4;19,43;01/04/2007;Klinik Fisioterapi;Pelayanan Fisioterapi;Fisik;Pelaksana;3;4;5;0;0;12;140.358,84;187.145,13;233.931,41;0;0;561.435; - ;561.435; Pelayanan Medik ; Pelayanan Fisioterapi ;0,00%
77;Nadia Prima Resti, A.Md., S.Mk;ASN;Perekam Medis mahir;D4;15,43;01/04/2011;Instalasi Rekam Medik;Pelayanan Rekam Medik;Fisik;Pelaksana;3;4;5;0;0;12;140.358,84;187.145,13;233.931,41;0;0;561.435; - ;561.435; Pelayanan Medik ; Pelayanan Rekam Medik ;0,00%
78;R.R Rani Meita Pratiwi Subagyono, S.Psi.,M.Psi;ASN;Psikologi Klinis Ahli Pertama;S2;5,58;01/02/2021;Klinik Psikologi;Pelayanan Psikologi;Fisik;Pelaksana;2,55;10;5;0;0;17,55;119.305,02;467.862,81;233.931,41;0;0;821.099; - ;821.099; Pelayanan Medik ; Pelayanan Psikologi ;0,00%
79;Elda Trialisa Putri,S.Psi.,M.Psi;ASN;Psikologi Klinis Ahli Pertama;S2;5,58;01/02/2021;Klinik Psikologi;Pelayanan Psikologi;Fisik;Pelaksana;2,55;10;5;0;0;17,55;119.305,02;467.862,81;233.931,41;0;0;821.099; - ;821.099; Pelayanan Medik ; Pelayanan Psikologi ;0,00%
80;Ns. Chamid Ansori, S.Kep.;ASN;Perawat Ahli Pertama;S1 PROFESI;16,43;01/04/2010;Perawat Elang;Perawat Elang;Fisik;Pelaksana;3;4,5;5;0;0;12,5;140.358,84;210.538,27;233.931,41;0;0;584.829; - ;584.829; Keperawatan ; Perawat Elang ;0,00%
81;Haryati,S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;15,43;01/04/2011;PPI;Perawat PPI;Fisik;KOORDINATOR/Katim;3;4,5;6;0;0;13,5;140.358,84;210.538,27;280.717,69;0;0;631.615; - ;631.615; Keperawatan ; Perawat PPI ;0,00%
82;Andi Supiyan Noor, A.Md.Kep.;ASN;Perawat Mahir;D3;14,42;01/04/2012;Perawat UPIP;Perawat PICU;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat PICU ;0,00%
83;Heny Andasari, A.Md.;ASN;Teknisi Elekromedis Mahir;D3;14,42;01/04/2012;Elektromedik IPSRS;Penunjang Elektromedik;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Penunjang Non Medik ; Penunjang Elektromedik ;0,00%
84;Dina Eko Purwani, A.Md.OT.;ASN;Okupasi Terapis Mahir;D3;19,43;02/04/2007;Klinik Okupasi Terapi;Pelayanan OT;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Pelayanan Medik ; Pelayanan OT ;0,00%
85;Rizani Rahman, A.Md.Kep.;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat Belibis;Perawat Belibis;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Belibis ;0,00%
86;Parid Fauzi, A.Md.Kep.;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat Elang;Perawat Elang;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Elang ;0,00%
87;Risca Eka Rahayu A.Md.AK.;ASN;Pranata Labkes Mahir;D3;10,42;01/04/2016;Instalasi Laboratorium;Penunjang Laboratorium;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Penunjang Medik ; Penunjang Laboratorium ;0,00%
88;Ns. Sumadi, S.Kep;ASN;Perawat Mahir;S1;17,43;01/04/2009;Perawat Napza;Perawat Napza;Fisik;KOORDINATOR/Katim;3;4;6;0;0;13;140.358,84;187.145,13;280.717,69;0;0;608.222; - ;608.222; Keperawatan ; Perawat Napza ;0,00%
89;Siti Zainab, A.Md.Kep;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat Enggang;Perawat Enggang;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat Enggang ;0,00%
90;Ns. Nurgianto Adi Kusuma, S.Kep;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat ICU;Perawat ICU;Fisik;KOORDINATOR/Katim;3;3,75;6;0;0;12,75;140.358,84;175.448,55;280.717,69;0;0;596.525; - ;596.525; Keperawatan ; Perawat ICU ;0,00%
91;Ns. Mikki Sindi, S.Kep;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat Tiung;Perawat Tiung;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Tiung ;0,00%
92;Mira Wati A.Md.Kep.;ASN;Perawat Mahir;D3;10,42;01/04/2016;Perawat Punai;Perawat Punai;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Keperawatan ; Perawat Punai ;0,00%
93;Abd.Rahman;ASN;Pengadministrasi Sarana dan Prasarana;SMU/SMK;18,43;01/04/2008;IPSRS;Administrasi IPSRS;Fisik;Kepala;3;1,375;7;0;0;11,38;140.358,84;64.331,14;327.503,97;0;0;532.194; - ;532.194; Penunjang Non Medik ; Administrasi IPSRS ;100,00%
94;Ns. Kartika Rizky Ananda,S.kep;ASN;Perawat Ahli Pertama;S1 PROFESI;5,58;01/02/2021;Perawat ICU;Perawat ICU;Fisik;Pelaksana;2,55;4,5;5;0;0;12,05;119.305,02;210.538,27;233.931,41;0;0;563.775; - ;563.775; Keperawatan ; Perawat ICU ;0,00%
95;Ns. Nova Salinding,S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;5,58;01/02/2021;Perawat Cendrawasih;Perawat Cendrawasih;Fisik;Pelaksana;2,55;4,5;5;0;0;12,05;119.305,02;210.538,27;233.931,41;0;0;563.775; - ;563.775; Keperawatan ; Perawat Cendrawasih ;0,00%
96;Ns. Nusiana Bumbungan,S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;5,58;01/02/2021;Perawat ICU;Perawat ICU;Fisik;Pelaksana;2,55;4,5;5;0;0;12,05;119.305,02;210.538,27;233.931,41;0;0;563.775; - ;563.775; Keperawatan ; Perawat ICU ;0,00%
97;Ns. Eri Rante La'bi, S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;5,58;01/02/2021;Perawat Punai;Perawat Punai;Fisik;Pelaksana;2,55;4,5;5;0;0;12,05;119.305,02;210.538,27;233.931,41;0;0;563.775; - ;563.775; Keperawatan ; Perawat Punai ;0,00%
98;Ns. Agus Dwi Putranto, S.Kep;ASN;Perawat Ahli Pertama;S1 PROFESI;13,01;01/09/2013;Perawat UPIP;Perawat PICU;Fisik;Pelaksana;3;4,5;5;0;0;12,5;140.358,84;210.538,27;233.931,41;0;0;584.829; - ;584.829; Keperawatan ; Perawat PICU ;0,00%
99;Priyanto A.Md.;ASN;Perekam Medis Mahir ;D3;10,42;01/04/2016;Instalasi Rekam Medik;Pelayanan Rekam Medik;Fisik;Pelaksana;3;3,75;5;0;0;11,75;140.358,84;175.448,55;233.931,41;0;0;549.739; - ;549.739; Pelayanan Medik ; Pelayanan Rekam Medik ;0,00%
100;Nurul Latifah,S.Tr.Kes;ASN;Pranta Labkes Ahli Pertama;D4;5,58;01/02/2021;Instalasi Laboratorium;Penunjang Laboratorium;Fisik;Pelaksana;2,55;4;5;0;0;11,55;119.305,02;187.145,13;233.931,41;0;0;540.382; - ;540.382; Penunjang Medik ; Penunjang Laboratorium ;0,00%`;

const rows = text.split('\n').filter(r => r.trim() && r.includes(';'));
const mapper = [];
rows.forEach((r, i) => {
  if (i === 0 || r.includes('TOTAL INDEKS')) return;
  const cols = r.split(';');
  const nama = cols[1];
  if (!nama || nama.trim() === '') return;

  const mapObj = {
    id: `gi-${i}`,
    kode: `GI-${String(i).padStart(3, '0')}`,
    namaPegawai: nama.trim(),
    golongan: cols[2] || '',
    jabatan: cols[3] || '',
    pendidikan: cols[4] || '',
    masaKerjaTahun: parseFloat((cols[5] || '0').replace(',', '.')) || 0,
    ruangan: cols[7] || '',
    kelompokJasa: cols[8] || '',
    riskCategory: cols[9] || '',
    jabatanUnit: cols[10] || '',
    skorMk: parseFloat((cols[11] || '0').replace(',', '.')) || 0,
    skorPd: parseFloat((cols[12] || '0').replace(',', '.')) || 0,
    skorJab: parseFloat((cols[13] || '0').replace(',', '.')) || 0,
    skorRis: parseFloat((cols[14] || '0').replace(',', '.')) || 0,
    skorEmg: parseFloat((cols[15] || '0').replace(',', '.')) || 0,
    skorTotal: parseFloat((cols[16] || '0').replace(',', '.')) || 0,
    rpMk: parseFloat((cols[17] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    rpPd: parseFloat((cols[18] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    rpJab: parseFloat((cols[19] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    rpRis: parseFloat((cols[20] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    rpEmg: parseFloat((cols[21] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    jaspelPostRemunerasi: parseFloat((cols[22] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    postPenyesuaianBebanKerja: parseFloat((cols[23] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    jaspelPostTotal: parseFloat((cols[24] || '0').replace(/\./g, '').replace(',', '.')) || 0,
    kelompokRekap: (cols[25] || '').trim(),
    kelompokPelayanan: (cols[26] || '').trim(),
    persenAdministrasi: (cols[27] || '').trim(),
    unitKerja: (cols[7] || '').trim(),
    nip: '-',
    skorDasar: 80,
    skorKompetensi: 80,
    skorRisiko: 75,
    skorKinerja: 85,
    bobotPresensi: 98,
    statusPegawai: (cols[2] || '').trim() === 'ASN' ? 'PNS' : 'Non-PNS'
  };
  mapper.push(mapObj);
});

let outputStr = "import { GeneralIndexItem } from '../types/index';\n\nexport const GENERAL_INDEX_CSV_DATA: GeneralIndexItem[] = [\n";
mapper.forEach((item, idx) => {
  outputStr += `  {\n`;
  Object.keys(item).forEach(key => {
    let val = item[key];
    if (typeof val === 'string') {
      outputStr += `    ${key}: "${val}",\n`;
    } else {
      outputStr += `    ${key}: ${val},\n`;
    }
  });
  outputStr += `  }${idx < mapper.length - 1 ? ',' : ''}\n`;
});
outputStr += `];\n`;

fs.writeFileSync('src/data/generalIndexCsvData.ts', outputStr);
console.log("File generated successfully.");
