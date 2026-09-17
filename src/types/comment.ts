export type ApplicationComment = {
  id: string;
  authorId: string;
  author: { name: string | null };
  body: string;
  createdAt: string;
};

export type ApplicationCommentListResponse = {
  comments: ApplicationComment[];
};

export type CreateApplicationCommentPayload = { body: string };
