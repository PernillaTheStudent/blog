import { useRouter } from "next/router";
import BlogEditor from "../../../../components/blog-editor";

import { getPost, editPost, postsCacheKey } from "../../../../api-routes/posts";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { createSlug } from "../../../../utils/createSlug";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default function EditBlogPost() {
  const router = useRouter();
  /* Use this slug to fetch the post from the database */
  const { slug } = router.query;

  const {
    data: { data: post = {} } = {},
    error,
    isLoading,
  } = useSWR(slug, getPost);
  
  console.log("post data", post)
  // const {
  //   data: { data: post = {} } = {},
  //   error,
  //   isLoading,
  // } = useSWR(slug ? `${postsCacheKey}${slug}` : null, () => getPost({ slug }));

  if (error) {
    return <div>Error loading post</div>;
  }

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  const { trigger: editPostTrigger } =
    useSWRMutation(`${postsCacheKey}${slug}`, editPost);

  const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    console.log({ editorContent, titleInput, image, slug });
    const updatedSlug = createSlug(titleInput);

    const updatedPost = {
      id: post.id,
      body: editorContent,
      title: titleInput,
      slug: updatedSlug,
      image,
    };

    const { data, error } = await editPostTrigger(updatedPost);

    if (!error) {
      router.push(`/blog/${updatedSlug}`);
    }
  };

  if (isLoading) {
    return "...loading";
  }

  return (
    <BlogEditor
      heading="Edit blog post"
      title={post.title}
      src={post.image}
      alt={post.title}
      content={post.body}
      buttonText="Save changes"
      onSubmit={handleOnSubmit}
    />
  );
}

// skydda routern /edit så att endast author kan editera här
export const getServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);

  const {
    data: { session }  // i datan finns en session som innehåller data om den autentiserade användaren
  } = await supabase.auth.getSession();
  // console.log(session);  // sker på servern, titta i terminalen

  const { slug } = ctx.params;   // or ctx.query

  const { data } = await supabase
    .from("posts")
    .select()
    .single()
    .eq("slug", slug);

  console.log("slug data", data)

  const isAuthor = data.user_id === session.user.id;
  console.log({ isAuthor });

  if (!isAuthor) {
    return {
      redirect: {
        destination: `/blog/${slug}`,   // url, vilken som helst
        permanent: true,
      }
    }
  }

  return {
    props: {},
  }
};