export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
  postDate?: Date;
  likes?: string[];
  dislikes?: string[];
  comments?: Comment[];
}
export interface Comment {
  content: string;
  user: string;
  createdAt?: Date; // Optional property for storing the comment creation date
}
