export default class PictureList {
    constructor({ _parent }) {
        this._parent = _parent;
        this._list;
        this.renderPaintList();
    }

    renderPaintList = () => {
        if (!this._parent || !(this._parent instanceof HTMLElement)) return;
        const pictureList = document.createElement('ul');
        pictureList.classList.add('picture-list');
        const pictureItem = document.createElement('li');
        pictureItem.classList.add('picture-list__item');
        const pictureImage = document.createElement('img');
        pictureImage.src = '/static/assets/textures/nighthawks.jpg';
        pictureImage.classList.add('picture-list__image');
        this._parent.appendChild(pictureList);
        pictureList.appendChild(pictureItem);
        pictureItem.appendChild(pictureImage);

        //         this._parent.innerHTML = `<ul class="picture-list">
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //                 <li class="picture-list__item">
        //                     <img
        //                         src="/static/assets/textures/nighthawks.jpg"
        //                         alt=""
        //                         class="picture-list__image"
        //                     />
        //                 </li>
        //             </ul>
        // `;
        this._list = document.querySelector('.picture-list');
        this.preventBubbling(this._list);
        return this._list;
    };

    // utils
    preventBubbling = (DOMElement) => {
        if (!DOMElement || !(DOMElement instanceof HTMLElement)) return;
        // DOMElement.addEventListener('beforexrselect', (e) => {
        //         e.preventDefault();
        //     });
        this._parent.addEventListener('beforexrselect', (e) => {
            e.preventDefault();
            // window.alert('clicked 1!');
        });
        DOMElement.addEventListener('beforexrselect', (e) => {
            // e.stopPropagation();
            e.preventDefault();
        });
        DOMElement.addEventListener('click', (e) => {
            // e.stopPropagation();
            e.preventDefault();
            window.alert('dom click');
        });
        // document
        //     .querySelector('#ui')
        //     .addEventListener('beforexrselect', (e) => {
        //         e.preventDefault();
        //         // window.alert('clicked 1!');
        //     });
        // this._parent.addEventListener('/
        // controller.addEventListener('select', () => {
        //     e.preventDefault();
        // });
        // DOMElement.addEventListener('selectend', (e) => {
        //     e.preventDefault();
        // });
    };
}
