import { useQuery } from "@tanstack/react-query";
import { act, waitFor } from "@testing-library/react";
import { enqueueSnackbar } from "notistack";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetBooksQuery } from "../../../entities/books/queries/get.query";
import { api } from "../../../shared/testing/utils/api";
import { deferred } from "../../../shared/testing/utils/deferred";
import { makeAxiosError } from "../../../shared/testing/utils/make-axios-error";
import { renderControllerWithBoundary } from "../../../shared/testing/utils/render-with-error-boundary";
import {
  renderController,
  signIn,
} from "../../../shared/testing/utils/test-utils";
import { useResetBooksController } from "../model/books-reset.controller";

type PutResponse = { data: { status: string } };

const setup = () => {
  signIn("alice");
  return renderController(() => useResetBooksController());
};

describe("useResetBooksController", () => {
  it("nobody is signed in → throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { onError } = renderControllerWithBoundary(() =>
      useResetBooksController(),
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].message).toMatch(/authenticated screen/);
  });

  it('initial state → label "Reset", isPending false', () => {
    const { result } = setup();

    expect(result.current.label).toBe("Reset");
    expect(result.current.isPending).toBe(false);
    expect(api.put).not.toHaveBeenCalled();
  });

  it("reset() → PUT /books/alice/reset", async () => {
    api.put.mockResolvedValue({ data: { status: "ok" } });
    const { result } = setup();

    act(() => result.current.reset());

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/books/alice/reset"),
    );
    expect(api.put).toHaveBeenCalledTimes(1);
  });

  it('request in flight → isPending true and label "Resetting…"; after success → back to normal', async () => {
    const d = deferred<PutResponse>();
    api.put.mockReturnValue(d.promise);
    const { result } = setup();

    act(() => result.current.reset());

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.label).toBe("Resetting…");

    d.resolve({ data: { status: "ok" } });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.label).toBe("Reset");
  });

  it("second reset() while pending → controller still reports isPending", async () => {
    // Контролер не блокує повторний виклик — це робить UI через loading кнопки.
    api.put.mockReturnValue(deferred<PutResponse>().promise);
    const { result } = setup();

    act(() => result.current.reset());
    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(result.current.isPending).toBe(true);
    expect(result.current.label).toBe("Resetting…");
  });

  it('success → active ["books"] queries are refetched', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.put.mockResolvedValue({ data: { status: "ok" } });
    signIn("alice");
    const { result } = renderController(() => ({
      reset: useResetBooksController(),
      list: useQuery(GetBooksQuery({ user: "alice", isPrivate: false })),
    }));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.list.isFetching).toBe(false));

    act(() => result.current.reset.reset());

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(api.get).toHaveBeenLastCalledWith("/books/alice");
  });

  describe("failure", () => {
    beforeEach(() => {
      api.put.mockRejectedValue(makeAxiosError({ status: 500 }));
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("API error → error toast is shown", async () => {
      const { result } = setup();

      act(() => result.current.reset());

      await waitFor(() => expect(enqueueSnackbar).toHaveBeenCalledOnce());
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), {
        variant: "error",
      });
    });

    it('API error → isPending false and label "Reset"', async () => {
      const { result } = setup();

      act(() => result.current.reset());

      await waitFor(() => expect(enqueueSnackbar).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(result.current.label).toBe("Reset");
    });

    it("API error → books are not refetched", async () => {
      api.get.mockResolvedValue({ data: [] });
      signIn("alice");
      const { result } = renderController(() => ({
        reset: useResetBooksController(),
        list: useQuery(GetBooksQuery({ user: "alice", isPrivate: false })),
      }));
      await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(result.current.list.isFetching).toBe(false));

      act(() => result.current.reset.reset());

      await waitFor(() => expect(enqueueSnackbar).toHaveBeenCalled());
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
