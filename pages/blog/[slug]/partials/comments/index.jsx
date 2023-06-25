import styles from "./comments.module.css";
import Comment from "../comment";
import useSWR from "swr";
import { getComments, commentsCacheKeyCacheKey } from "../../../../../api-routes/comments";
import { useUser } from "@supabase/auth-helpers-react";

export default function Comments({ postId }) {
  /* 
  Here is a good place to fetch the comments from the database that has a 
  foreign key relation to the post.
  */
  const user = useUser();

  const {
    data: { data: comments = [] } = {},
    error,
    isLoading } = useSWR(postId, getComments);

    if (error) {
      return <div>Error loading comment</div>;
    }
  
    if (isLoading) {
      return <div>Loading comment...</div>;
    }
  
  return (
    <div className={styles.container}>
      {
        comments.length > 0 && (
          <h2>Comments</h2>
        )
      }
      {
        comments?.map((comment) => (
          <Comment key={comment.id} {...comment} />
        ))
      }
    </div>
  );
}
