# Upload image to a bucket

Docs covering the basic of how to create a bucket in the ui:
https://supabase.com/docs/guides/storage

Check the 2 min video introduction to get a broad overview

The whole demo is recorded and i highy recommend to watch it unless you haven't already.
This is a text summary of what we have done in order to create a bucket, set row level security policy, upload a file, retreive the public url and include it to the posts image.

## Create a bucket and add RLS (row level security) to it.

Login to the supabase dashboard if you haven't already.
Click on the "Storage" tab at the and click on "New bucket".
Name the bucket "images" and toggle the "public bucket" to make it active and press "Save".

Next, navigate to the SQL editor and click on "New query".

Paste this SQL-query below and click on "RUN" in order to allow everyone to get full access to the bucket:

```
CREATE POLICY "Can select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Can delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'images');
CREATE POLICY "Can insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'images');
CREATE POLICY "Can update" ON storage.objects FOR UPDATE TO public WITH CHECK (bucket_id = 'images');
```

## Create an upload image function that we can reuse in multiple places:

Once the bucket is in place, we can now focus on code.
In the utils folder in the root of the nextjs application, create a new file called uploadImage.js and insert the following:

```
import { supabase } from "../lib/supabaseClient";

export const uploadImage = async (file) => {
  const fullFileName = file.name.split(".");
  const fileName = fullFileName[0];
  const fileExt = fullFileName[1];

  const filePath = `${fileName}-${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error };
  }

  const {
    data: { publicUrl },
    error: publicUrlError,
  } = await supabase.storage.from("images").getPublicUrl(data.path);

  if (publicUrlError) {
    return { error: publicUrlError };
  }

  return {
    error: false,
    publicUrl,
  };
};

```

See the live recording for further description of what this function is doing step by step.

## Implement the new function to our create post functionality.

Inside the `index.jsx` file in `pages/create-post/` is the component that handles the creation of a new blog post.
The `handleOnSubmit` function already passes an image prop.
This is the `File` that contains all relevant information about the image that has been uploaded. Pass that along to the mutation trigger like this:

```
const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const slug = createSlug(titleInput);

    const newPost = {
      body: editorContent,
      title: titleInput,
      slug,
      user_id: user.id,
      image, //Pass it in here
    };

    const { error } = await addPostTrigger(newPost);

    if (!error) {
      router.push(`/blog/${slug}`);
    }
  };
```

The addPostTrigger is sending the newPost object to our `addPost` function.
This function will handle the uploading part with the help of our uploadImage function like this:

```
export const addPost = async (_, { arg: newPost }) => {
  let image = "";

  if (newPost?.image) {
    const { publicUrl, error } = await uploadImage(newPost?.image);

    if (!error) {
      image = publicUrl;
    }
  }

  const { data, error, status } = await supabase
    .from("posts")
    .insert({ ...newPost, image })
    .select()
    .single();

  return { data, error, status };
};
```

## Allow our nextjs application to handle external image resources.

Once the image has been uploaded and added to the database, you will get redirected to the uploaded blog post if you followed along with my example.

What is supposed to happen here is that nextjs will throw an error saying you must add the supabase project URL into the domain options array in your `next.config.js` file.

The reason for this is because our application is using nextjs build in `Image` component in order to display the image.

The domains option inside the images configuration is used when you want to use images hosted on external servers in combination with Next.js' Image Component or Image Optimization features.

The Next.js Image component and Automatic Image Optimization require that you specify which domains are allowed to be optimized.

This is necessary because these features need to download the image from a remote server, transform it, and serve it. For security reasons, you must define a list of allowed domains from where images can be fetched and optimized.

Add your supabase URL (its the one you have in your environment variable).

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
        "media.wired.com",
        "ruzcrcqyclwoeykyvsdh.supabase.co"  // This is MY project name, paste in your own here

        ],
  },
};

module.exports = nextConfig;

```

## Implement the same kind of upload functionality to the edit component.

With the previous step in place, you should now be able to see your uploaded image that is connected to your blog post.

The edit page component is placed here `pages/blog/slug/edit/index.jsx`

This component also passes an image in the same way as the create-post function.

Change the `handleOnSubmit` function like this. The `editPostTrigger` should be a trigger connected to the `editPost` function.

```
 const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const updatedSlug = createSlug(titleInput);

    const updatedPost = {
      id: post.id,
      body: editorContent,
      title: titleInput,
      slug: updatedSlug,
      image,
    };

    const { error } = await editPostTrigger(updatedPost);

    if (!error) {
      router.push(`/blog/${updatedSlug}`);
    }
  };
```

The `editPost` function in the `api-routes/posts.js` should handle the edit like this:

```
export const editPost = async (_, { arg: updatedPost }) => {
  let image = updatedPost?.image ?? "";

  const isNewImage = typeof image === "object" && image !== null;

  if (isNewImage) {
    const { publicUrl, error } = await uploadImage(updatedPost?.image);

    if (!error) {
      image = publicUrl;
    }
  }

  const { data, error, status } = await supabase
    .from("posts")
    .update({ ...updatedPost, image })
    .eq("id", updatedPost.id)
    .select()
    .single();

  return { data, error, status };
};
```

Now all functionality for uploading an image, add it to a blog post as well as edit an existing blog post is in place 💖

## EXTRA:

Do you also notice that the uploaded image is pixelated?
Its a frontend flaw caused by me. To fix it, go to `/components/blog-image-banner/index.jsx` and change the width and height properties to 800x400 like this:

```
import Image from "next/image";
import styles from "./blog-image-banner.module.css";

export default function BlogImageBanner({ src, alt = "" }) {
  return (
    <div className={styles.imageContainer}>
      <Image
        src={src}
        alt={alt}
        className={styles.image}
        width={800}
        height={400}
      />
    </div>
  );
}

```
