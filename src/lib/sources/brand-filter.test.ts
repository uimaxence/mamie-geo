import { describe, expect, it } from "vitest";
import {
  parseBrandIdsFromSearchParam,
  serializeBrandIdsToSearchParam,
} from "./brand-filter";

describe("parseBrandIdsFromSearchParam", () => {
  const available = ["a", "b", "c"];

  it("retourne all si le param est absent", () => {
    expect(parseBrandIdsFromSearchParam(undefined, available)).toEqual(["a", "b", "c"]);
  });

  it("retourne all si le param est une string vide", () => {
    expect(parseBrandIdsFromSearchParam("", available)).toEqual(["a", "b", "c"]);
  });

  it("filtre les IDs reconnus", () => {
    expect(parseBrandIdsFromSearchParam("a,b", available)).toEqual(["a", "b"]);
  });

  it("ignore les IDs inconnus (anti-injection)", () => {
    expect(parseBrandIdsFromSearchParam("a,X,b", available)).toEqual(["a", "b"]);
  });

  it("retombe sur all si tous les IDs demandés sont invalides", () => {
    expect(parseBrandIdsFromSearchParam("X,Y", available)).toEqual(["a", "b", "c"]);
  });

  it("prend le premier élément si Array (cas Next.js searchParams)", () => {
    expect(parseBrandIdsFromSearchParam(["a,b", "c"], available)).toEqual(["a", "b"]);
  });
});

describe("serializeBrandIdsToSearchParam", () => {
  it("retourne null si tout est sélectionné", () => {
    expect(serializeBrandIdsToSearchParam(["a", "b"], ["a", "b"])).toBeNull();
  });

  it("retourne null si rien n'est sélectionné", () => {
    expect(serializeBrandIdsToSearchParam([], ["a", "b"])).toBeNull();
  });

  it("retourne la liste join par virgule sinon", () => {
    expect(serializeBrandIdsToSearchParam(["a"], ["a", "b", "c"])).toBe("a");
    expect(serializeBrandIdsToSearchParam(["a", "c"], ["a", "b", "c"])).toBe("a,c");
  });
});
