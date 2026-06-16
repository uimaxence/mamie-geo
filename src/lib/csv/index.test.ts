import { describe, expect, it } from "vitest";
import { stringifyCsv } from "./index";

describe("stringifyCsv", () => {
  it("écrit BOM + en-tête + lignes en CRLF", () => {
    const csv = stringifyCsv(
      [
        { a: "x", b: 1 },
        { a: "y", b: 2 },
      ],
      ["a", "b"],
    );
    expect(csv).toBe("﻿a,b\r\nx,1\r\ny,2\r\n");
  });

  it("échappe les virgules, guillemets et newlines", () => {
    const csv = stringifyCsv(
      [{ v: "comma, here" }, { v: 'quote "x"' }, { v: "line\nbreak" }],
      ["v"],
    );
    expect(csv).toBe('﻿v\r\n"comma, here"\r\n"quote ""x"""\r\n"line\nbreak"\r\n');
  });

  it("traite null/undefined comme vide", () => {
    const csv = stringifyCsv([{ a: null, b: undefined, c: "ok" }], ["a", "b", "c"]);
    expect(csv).toBe("﻿a,b,c\r\n,,ok\r\n");
  });

  it("sérialise les Date en ISO", () => {
    const csv = stringifyCsv([{ d: new Date("2026-06-08T12:00:00Z") }], ["d"]);
    expect(csv).toBe("﻿d\r\n2026-06-08T12:00:00.000Z\r\n");
  });

  it("retourne un CSV avec en-tête seul si aucune row", () => {
    const csv = stringifyCsv<{ a: string }>([], ["a"]);
    expect(csv).toBe("﻿a\r\n");
  });
});
