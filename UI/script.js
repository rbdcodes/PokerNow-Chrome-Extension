const addButton = document.getElementById("addComponent");
const componentList = document.querySelector(".component-list");

addButton.addEventListener("click", () => {
  const newComponent = document.createElement("div");
  newComponent.className = "component";
  newComponent.textContent = "New Component";
  componentList.appendChild(newComponent);
});
