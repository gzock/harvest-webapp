// thanks for https://qiita.com/daikiojm/items/2b4cc4c6a0e3735aad48

import { MatPaginatorIntl } from '@angular/material';

export class MatPaginatorIntlJa extends MatPaginatorIntl {
  itemsPerPageLabel = '表示件数';
  nextPageLabel = '次のページ';
  previousPageLabel = '前のページ';
  firstPageLabel = '最初のページ';
  lastPageLabel = '最後のページ';

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `${length} 件中 0`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

    return `${length} 件中 ${startIndex + 1} - ${endIndex}`;
  }
}
