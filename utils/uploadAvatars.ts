// import { supabase } from '@/lib/supabase';
// import { decode } from 'base64-arraybuffer';

// export async function uploadAvatarFromBase64(uid: string, base64: string) {
//   const filePath = `${uid}/${Date.now()}.jpg`;

//   // Chuyển base64 -> ArrayBuffer (không cần Blob)
//   const arrayBuffer = decode(base64);

//   const { error } = await supabase
//     .storage
//     .from('avatars')
//     .upload(filePath, arrayBuffer, {
//       contentType: 'image/jpeg',
//       upsert: true,
//     });

//   if (error) throw error;

//   const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
//   return data.publicUrl; // URL public
// }