import { useRouter } from "next/router";
import styles from "./blog-post.module.css";
import Comments from "./partials/comments";
import AddComment from "./partials/add-comment";
import Button from "@components/button";
import Heading from "@components/heading";
import BlogImageBanner from "@components/blog-image-banner";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { getPost, removePost, postsCacheKey } from "@/api-routes/posts";
import { useUser } from "@supabase/auth-helpers-react";


export default function BlogPost() {
  const router = useRouter();
  const user = useUser();

  /* Use this slug to fetch the post from the database */
  const { slug } = router.query;

  const { data: { data: post = [] } = {},  // returns ONE data objekt instead of data.data
    error,
    isLoading } = useSWR(slug, getPost);

  const { trigger: deleteTrigger, isMutating } = useSWRMutation(slug, removePost);

  if (error) {
    return <div>Error loading post</div>;
  }

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const handleDeletePost = async (postId) => {
    const { error, status } = await deleteTrigger(postId);

    if (!error) {
      router.push("/blog");
    } else {
      return <div>Error deleting post</div>;
    }
  };

  const handleEditPost = () => {
    router.push(`/blog/${slug}/edit`);
  };

  let isEditor = false;
  if (user) {
    isEditor = post.user_id === user.id;
  }

  return (
    <>
      <section className={styles.container}>
        <Heading>{post.title}</Heading>
        {post?.image && <BlogImageBanner src={post.image} alt={post.title} />}
        <div className={styles.dateContainer}>
          <time className={styles.date}>{post.createdAt}</time>
          <div className={styles.border} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
        <span className={styles.author}>Author: {post.author}</span>
        {
          /* The Delete & Edit part should only be showed if you are authenticated and you are the author */
          isEditor && (
            <div className={styles.buttonContainer}>
              <Button onClick={() => handleDeletePost(post.id)}>Delete</Button>
              <Button onClick={handleEditPost}>Edit</Button>
            </div>
          )
        }
      </section>

      <Comments postId={post.id} />

      {
        /* This component should only be displayed if a user is authenticated */
        user && (
          <AddComment postId={post.id} />
        )
      }
    </>
  );
}
