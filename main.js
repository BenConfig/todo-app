/* ------------------------------------------------------ */
/*                    Toggle Dark Mode                    */
/* ------------------------------------------------------ */
const TOGGLE = document.querySelector('.btn-toggle-dark-mode');
const STATUS = document.getElementById('status');

TOGGLE.addEventListener('click', function() {
    if (document.documentElement.classList.contains('dark')){
        document.documentElement.classList.remove('dark');
        STATUS.innerText = 'Dark mode is off.';
    }
    else {
        document.documentElement.classList.add('dark');
        STATUS.innerText = 'Dark mode is on.';
    }
});

/* ------------------------------------------------------ */
/*                 Todo Item Functionality                */
/* ------------------------------------------------------ */
let isAnimating = false;

const TODO_LIST = document.querySelector('.list');
const ITEMS_LEFT = document.querySelector('.items-left');

function updateItemsLeftNum() {
    let completedItems = 0;
    for (let item of TODO_LIST.children) {
        if (item.classList.contains('completed')) completedItems++;
    }
    ITEMS_LEFT.innerText = TODO_LIST.children.length - completedItems + ' items left';
}

// Initial call
updateItemsLeftNum();

/* ----------------- Create a Todo Item ----------------- */
const CREATE_ITEM_INPUT = document.querySelector('.create-todo-input');
const CREATE_ITEM_BTN = document.querySelector('.circle-create-item');

function createItem() {
    const itemText = CREATE_ITEM_INPUT.value.trim();
    if (!itemText) return;

    // Make <li>
    const item = document.createElement('li');
    item.classList.add('item', 'reveal');
    item.setAttribute('draggable', 'true');

    // Make 'complete' <button>
    const completeBtn = document.createElement('button');
    completeBtn.classList.add('circle', 'circle-complete-item');
    completeBtn.setAttribute('type', 'button');
    completeBtn.setAttribute('aria-label', 'Complete item');

    // Make <span> for item task
    const itemTextContainer = document.createElement('span');
    itemTextContainer.classList.add('task');
    itemTextContainer.innerText = itemText;

    // Make <span> for item completion status
    const completionStatus = document.createElement('span');
    completionStatus.classList.add('sr-only');
    completionStatus.setAttribute('aria-live', 'polite');
    completionStatus.innerText = 'Task not yet completed';
    
    // Make 'delete' <button>
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-delete-item');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.setAttribute('aria-label', 'Delete item');

    item.append(completeBtn, itemTextContainer, completionStatus, deleteBtn);

    TODO_LIST.append(item);
    
    CREATE_ITEM_INPUT.value = '';

    setTimeout(() => item.classList.remove('reveal'));

    updateItemsLeftNum();
};

CREATE_ITEM_INPUT.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') createItem();
});
CREATE_ITEM_BTN.addEventListener('click', createItem);

/* ------------ Only Show Selected Todo Items ----------- */
const SHOW_BTNS = document.querySelectorAll('[type="radio"]');

function shownItemsFilter() {
    if (SHOW_BTNS[0].checked) { // The 'All' radio button
        for (let item of TODO_LIST.children) {
            if (item.classList.contains('hide')) {
                item.classList.remove('hide');
            }
        }
    }

    else if (SHOW_BTNS[1].checked) { // The 'Active' radio button
        for (let item of TODO_LIST.children) {
            if (item.classList.contains('completed')) {
                item.classList.add('hide');
            }
            else if (item.classList.contains('hide')) {
                item.classList.remove('hide');
            }
        }
    }

    else if (SHOW_BTNS[2].checked) { // The 'Completed' radio button
        for (let item of TODO_LIST.children) {
            if (!item.classList.contains('completed')) {
                item.classList.add('hide');
            }
            else if (item.classList.contains('hide')) {
                item.classList.remove('hide');
            }
        }
    }
}

SHOW_BTNS.forEach(btn => btn.addEventListener('change', shownItemsFilter));

/* ---------------- Complete a Todo Item ---------------- */
TODO_LIST.addEventListener('click', function(e)  {
    if (e.target.classList.contains('circle-complete-item')) {
        
        let PARENT_LI = e.target.parentElement;

        if (!PARENT_LI.classList.contains('completed')) {
            if (isAnimating) return;

            isAnimating = true;

            PARENT_LI.classList.add('completed');
            setTimeout(function() {
                PARENT_LI.classList.add('fade');
                isAnimating = false;
                
                PARENT_LI.querySelector('[aria-live="polite"]').innerText = 'Task completed';

                updateItemsLeftNum();
                shownItemsFilter();
            }, 250);
        }
        else {

            if (isAnimating) return;

            PARENT_LI.classList.remove('completed');
            PARENT_LI.classList.remove('fade');

            PARENT_LI.querySelector('[aria-live="polite"]').innerText = 'Task not yet completed';

            updateItemsLeftNum();
            shownItemsFilter();
        }
    }
});

/* ----------------- Delete a Todo Item ----------------- */
TODO_LIST.addEventListener('click', e => {
    if (e.target.classList.contains('btn-delete-item')) {
        if (isAnimating) return;

        isAnimating = true;

        let PARENT_LI = e.target.parentElement;

        PARENT_LI.classList.add('delete');
        
        setTimeout(function() {
            PARENT_LI.remove();
        }, 250);

        setTimeout(function() {
            isAnimating = false;
            updateItemsLeftNum();
        }, 250);
    }
})

/* ------------- Clear Completed Todo Items ------------- */
const CLEAR_COMPLETED = document.querySelector('.btn-clear-completed');

CLEAR_COMPLETED.addEventListener('click', function() {

    let deleteCount = 0;

    for (let item of TODO_LIST.children) {
        if (item.classList.contains('completed')) {
            
            deleteCount++;

            item.classList.add('delete');
            
            setTimeout(function() {
                item.remove();
            }, 250);
        }
    }
    updateItemsLeftNum(deleteCount);
});

/* ------------- Drag and Drop Functionality ------------ */
let draggables = [];

TODO_LIST.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('item') || e.target.classList.contains('task')) {
        draggables = [...TODO_LIST.children];
    }

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        })
    
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        })
    })
})

TODO_LIST.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(TODO_LIST, e.clientY);
    
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        TODO_LIST.appendChild(draggable);
    }
    else {
        TODO_LIST.insertBefore(draggable, afterElement)
    }
})

function getDragAfterElement(TODO_LIST, yPosition) {
    const draggableElements = [...TODO_LIST.querySelectorAll('.item:not(.dragging)')]
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = yPosition - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        }
        else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* ------------------------------------------------------ */
/*         Stop Animations During Window Resizing         */
/* ------------------------------------------------------ */
let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});