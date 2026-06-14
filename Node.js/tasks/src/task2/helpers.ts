export const capitalizeName = (name: string) => {
  const names = name
    .split(" ")
    .map((name) => name[0].toUpperCase() + name.slice(1).toLowerCase());

  return names.join(" ");
};

export const normalizeEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "INVALID";
  }

  return email.toLowerCase();
};

export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return "INVALID";
};

export const standardizeDate = (date: string) => {
  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return "INVALID";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
