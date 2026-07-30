export type Page = {
  id: string;
  title: string;
  content: string;

  icon: string;
 cover: string;
  favorite: boolean;

  parentId: string | null;
  isExpanded: boolean;

  createdAt: Date;
  updatedAt: Date;
};
