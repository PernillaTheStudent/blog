import { useRouter } from "next/router";
import BlogEditor from "../../../../components/blog-editor";

import { getPost, postsCacheKey } from "@api-routes/posts";
// import { getPost } from "../../../../api-routes/posts";
import useSWR from "swr";
import { createSlug } from "../../../../utils/createSlug";

const mockData = {
  title: "Community-Messaging Fit",
  body: "<p>This is a good community fit!</p>",
  image:
    "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/16:9/w_2123,h_1194,c_limit/phonepicutres-TA.jpg",
};

export default function EditBlogPost() {
  const router = useRouter();
  /* Use this slug to fetch the post from the database */
  const { slug } = router.query;

  const {
    data: { data: post = {} } = {},
    error,
    isLoading,
  } = useSWR(slug ? `${postsCacheKey}${slug}` : null, () => getPost({ slug }));
  console.log("data", data)

  const handleOnSubmit = ({ editorContent, titleInput, image }) => {
    console.log({ editorContent, titleInput, image, slug });
    const updatedSlug = createSlug(title);

    const updatedPost = {
      id: post.id,
      body: editorContent,
      title: titleInput,
      slug: updatedSlug,
    };

    console.log(updatedPost);
  };

  if (isLoading) {
    return "...loading";
  }

  return (
    <BlogEditor
      heading="Edit blog post"
      title={mockData.title}
      src={mockData.image}
      alt={mockData.title}
      content={mockData.body}
      buttonText="Save changes"
      onSubmit={handleOnSubmit}
    />
  );
}
