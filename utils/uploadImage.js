import { supabase } from "../lib/supabaseClient";

export const uploadImage = async (file) => {
    console.log(file);

    const fullFileName = file.name.split(".");
    const fileName = fullFileName[0];
    const fileExt = fullFileName[1];
    const filePath = `${fileName}-${Math.random() * 10 ** 17}.${fileExt}`;

    // console.log(fullFileName);
    console.log({ fileName, fileExt });
    console.log({ filePath })

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        return { error };
    }

    console.log({ data });
    
    const {
        data: { publicUrl },
        error: publicUrlError
    } = await supabase.storage
        .from('images')
        .getPublicUrl(data.path);

    console.log({ publicUrl });

    if (publicUrlError) {
        return { error: publicUrlError };
    }

    return {
        error: false,
        publicUrl,
    };

};