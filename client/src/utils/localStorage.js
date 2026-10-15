const KEY = "saved_books";

export const getSavedBookIds = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export const saveBookIds = (bookIds) => {
  if (bookIds.length) {
    localStorage.setItem(KEY, JSON.stringify(bookIds));
  } else {
    localStorage.removeItem(KEY);
  }
};

export const removeBookId = (bookId) => {
  saveBookIds(getSavedBookIds().filter((id) => id !== bookId));
};
