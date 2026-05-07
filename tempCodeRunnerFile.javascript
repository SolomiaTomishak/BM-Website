localStorage.setItem("theme", "dark");

fetch("users.json")
  .then((res) => res.json())
  .then((users) => {
    localStorage.setItem("users", JSON.stringify(users));
  });

const theme = localStorage.getItem("theme");
console.log(theme);

const users = JSON.parse(localStorage.getItem("users"));
console.log(users);

localStorage.removeItem("theme");
