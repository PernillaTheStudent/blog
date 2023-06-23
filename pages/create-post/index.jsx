import BlogEditor from "@/components/blog-editor";
import { createSlug } from "@/utils/createSlug";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function CreatePost() {
  const router = useRouter();
  const user = useUser();

  const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const slug = createSlug(titleInput);

    console.log({ editorContent, titleInput, image, slug });

    const newPost = {
      body: editorContent,
      title: titleInput,
      slug,
      user_id: user.id,
    }

    const { error } = await addPostTrigger(newPost);

    if (!error) {
      router.push(`/blog/${slug}`);
    }
  };

  return (
    <BlogEditor
      heading="Create post"
      onSubmit={handleOnSubmit}
      buttonText="Upload post"
    />
  );
}
