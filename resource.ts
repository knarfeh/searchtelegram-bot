export interface Tag {
  count: number;
  name: string;
}

export interface Resource {
  tgid: string;
  title?: string;
  desc?: string;
  tags?: Tag[];
  type?: string;
  imgsrc?: string;
}
