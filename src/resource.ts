export interface ITag {
  count: number;
  name: string;
}

export interface IResource {
  tgid: string;
  title?: string;
  desc?: string;
  tags?: ITag[];
  type?: string;
  imgsrc?: string;
}
