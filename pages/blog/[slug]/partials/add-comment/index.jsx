import { useRef } from "react";
import Button from "@components/button";
import Input from "@components/input";
import Label from "@components/label";
import TextArea from "@components/text-area";
import styles from "./add-comment.module.css";
import useSWRMutation from "swr/mutation";
import { addComment } from "../../../../../api-routes/comments";
import { useUser } from "@supabase/auth-helpers-react";

export default function AddComment({ postId }) {
  const user = useUser();
  const formRef = useRef(); // create a reference

  const { trigger: addCommentTrigger, isMutating } = useSWRMutation(postId, addComment);

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    // Alternative way to get the form data
    const formData = new FormData(event.target);

    const { author, comment } = Object.fromEntries(formData);

    /* 
      Perhaps a good place to add a comment to the database that is associated with the blog post 😙
      */
    // console.log({ author, comment, postId });
    const newComment = {
      author: author,
      post_id: postId,
      comment: comment,
      user_id: user.id,
    }

    const { data, error, status } = await addCommentTrigger(newComment);

    if (error) {
      return <div>Error adding comment</div>;
    }  

    // Reset the form after submission?
    formRef.current.reset();
  };

  return (
    <div className={styles.container}>
      <h2>Add a comment</h2>
      <form ref={formRef} className={styles.form} onSubmit={handleOnSubmit}>
        <div className={styles.inputContainer}>
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" />
        </div>

        <div className={styles.inputContainer}>
          <Label htmlFor="comment">Comment</Label>
          <TextArea id="comment" name="comment" />
        </div>

        <Button className={styles.addCommentButton} type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
}
