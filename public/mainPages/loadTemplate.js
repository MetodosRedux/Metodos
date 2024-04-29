export function addTemplate(aTemplateId) {
    const template = document.getElementById(aTemplateId);
    const clone = template.content.cloneNode(true);

    const tempContainer = document.createElement('div');
    tempContainer.appendChild(clone);

    const menuContainer = tempContainer.querySelector('#menuInfo');
    document.body.appendChild(menuContainer);
}

