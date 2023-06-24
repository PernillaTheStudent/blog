import BlogEditor from "@/components/blog-editor";
import { createSlug } from "@/utils/createSlug";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { addPost, postsCacheKey } from "../../api-routes/posts";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";


export default function CreatePost() {
  const router = useRouter();
  const user = useUser();

  const { trigger: addPostTrigger } = useSWRMutation(postsCacheKey, addPost);

  const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const slug = createSlug(titleInput);

    console.log({ editorContent, titleInput, image, slug });

    const newPost = {
      body: editorContent,
      title: titleInput,
      slug,
      user_id: user.id,
      image,
    }

    const { error } = await addPostTrigger(newPost);

    if (!error) {
      router.push(`/blog/${slug}`);
    }
  };

  return (
    <>
    {/* <input type="file" onChange={e => console.log(e.target.files)} /> */}
    {/* <input type="file" onChange={e => console.log(e.target.files[0])} /> */}

    <BlogEditor
      heading="Create post"
      onSubmit={handleOnSubmit}
      buttonText="Upload post"
    />
    </>
  );
}
