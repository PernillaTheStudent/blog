import Button from "@components/button";
import styles from "./comment.module.css";
import { useUser } from "@supabase/auth-helpers-react";
import useSWRMutation from "swr/mutation";
import { removeComment } from "../../../../../api-routes/comments";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Comment({ comment, created_at, author, id, user_id }) {
  const user = useUser();
  const router = useRouter();
  const [commentExist, setCommentExist] = useState(true);

  const { trigger: deleteTrigger, isMutating } = useSWRMutation(id, removeComment);

  const handleDeleteComment = async () => {
    const { error, status } = await deleteTrigger(id);

    if (!error) {
      setCommentExist(false);
    } else {
      return <div>Error deleting comment</div>
    }
  };

  let isCommentEditor = false;
  if (user) {
    isCommentEditor = user_id === user.id;
  }

  return (
    <>
      {commentExist && (
        <div className={styles.container}>
          <p>{comment}</p>
          <p className={styles.author}>{author}</p>
          <time className={styles.date}>{created_at}</time>

          {
            /* The Delete part should only be showed if you are authenticated and you are the author */
            isCommentEditor &&
            <div className={styles.buttonContainer}>
              <Button onClick={handleDeleteComment}>Delete</Button>
            </div>
          }
        </div>
      )}
    </>
  );
}
