export type MarkarydsliganDefaultSerie = {
  name: string;
  schedule: string;
  url: string;
};

// Default-serier (nuvarande innehåll på sidan) som kan importeras till databasen.
export const markarydsliganDefaultSeries: MarkarydsliganDefaultSerie[] = [
  {
    name: "Serie A",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8693&fromAdmin=1",
    schedule: "Måndag 19:00",
  },
  {
    name: "Serie B",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8694&fromAdmin=1",
    schedule: "Tis 19:30",
  },
  {
    name: "Serie C",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8695&fromAdmin=1",
    schedule: "Mån 18:00",
  },
  {
    name: "Serie D",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8696&fromAdmin=1",
    schedule: "Tis 17:30",
  },
  {
    name: "Serie E",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8697&fromAdmin=1",
    schedule: "Tis 18:30",
  },
  {
    name: "55+ Grupp 1",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8822&fromAdmin=1",
    schedule: "Torsdagar 14:00",
  },
  {
    name: "55+ Grupp 2",
    url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8823&fromAdmin=1",
    schedule: "Torsdagar 15:30",
  },
];
