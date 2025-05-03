// ... (kode komponen React Anda)

async function onSubmit(values: FormSchemaType) {
    let tanggalLahirDbFormat: string | null = null;
    if (values.tanggalLahir instanceof Date) {
        try {
            tanggalLahirDbFormat = format(values.tanggalLahir, 'yyyy-MM-dd');
        } catch (error) {
            console.error("Error converting date for DB:", error);
        }
    }

    const dataToSubmit = {
        ...values,
        tanggalLahir: tanggalLahirDbFormat,
        tempatTanggalLahir: tempatTanggalLahir,
        alamatLengkap: alamatLengkap,
        noHpAyah: values.noHpAyah || null,
        noHpIbu: values.noHpIbu || null,
        namaWali: values.tinggal === 'Bersama Wali' ? values.namaWali : null,
        hubunganWali: values.tinggal === 'Bersama Wali' ? values.hubunganWali : null,
        pendidikanWali: values.tinggal === 'Bersama Wali' ? values.pendidikanWali : null,
        pekerjaanWali: values.tinggal === 'Bersama Wali' ? values.pekerjaanWali : null,
        alamatWali: values.tinggal === 'Bersama Wali' ? values.alamatWali : null,
        noHpWali: values.tinggal === 'Bersama Wali' ? values.noHpWali || null : null,
        nisn: values.nisn || null,
        punyaPiagam: values.punyaPiagam || null,
    };

    console.log('Form Submitted Data:', dataToSubmit);

    try {
        const response = await fetch('/api/pendaftaran', { // Ganti dengan path API endpoint Anda
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit),
        });

        if (!response.ok) {
            // Tangani respons error
            console.error('Response status:', response.status);
            console.error('Response body:', await response.json()); // Log the response body
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        toast({
            title: "Pendaftaran Berhasil!",
            description: `Data Anda telah berhasil dikirim. Nomor Pendaftaran Anda: ${result.id}. Silakan lanjutkan ke proses Daftar Ulang.`,
            variant: "default",
        });
        form.reset();
        setTempatTanggalLahir(null);
        setAlamatLengkap(null);
        setCurrentStep(0);
        // Tampilkan atau simpan nomor pendaftaran (result.id)
    } catch (error) {
        console.error("Submission error:", error);
        toast({
            title: "Pendaftaran Gagal!",
            description: "Terjadi kesalahan saat mengirim data. Silakan coba lagi.",
            variant: "destructive",
        });
    }
}

// ... (sisa kode komponen React Anda)