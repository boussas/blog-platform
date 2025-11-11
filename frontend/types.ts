export interface Article {
  id: string | number;
  _id?: string;
  title: string;
  body: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
