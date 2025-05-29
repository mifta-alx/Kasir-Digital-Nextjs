import { createClient } from "@supabase/supabase-js";
import type {Bucket} from "@/server/bucket";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export async function uploadFileToSignedUrl({
                                                file,
                                                path,
                                                token,
                                                bucket
}:{
    file:File;
    path:string;
    token:string;
    bucket:Bucket;
}){
    try{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {data, error} = await supabaseClient.storage
            .from(bucket)
            .uploadToSignedUrl(path, token, file);

        if(error) throw error;

        if(!data) throw new Error("No data returned from uploadToSignedUrl");

        const fileUrl = supabaseClient.storage.from(bucket).getPublicUrl(data?.path);

        return fileUrl.data.publicUrl;
    }catch(error){
        throw error;
    }
}
