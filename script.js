const storeItems = [
  {
    id: 0,
    title: '',
    description: `Букет "Гравитация". Необычные формы и текстуры лепестков создают эффект парения, символизируя притяжение и магию космоса.`,
    imageUrl: './images/букет7.jpg',
    price: 110,
    type: 'flower',
  },
  {
    id: 1,
    title: '',
    description: `Букет "Орбита любви". Символизирует вечную любовь и преданность, сочетая в себе земные розы и цветы, выращенные на орбитальных станциях.`,
    imageUrl: './images/букет3.jpg',
    price: 220,
    type: 'flower',
  },
  {
    id: 2,
    title: '',
    description: `Букет "Звездный рассвет". Цветы этого букета светятся в темноте благодаря особым условиям выращивания в невесомости.`,
    imageUrl: './images/букет2.png',
    price: 330,
    type: 'flower',
  },
  {
    id: 3,
    title: '',
    description: `Букет "Лунная симфония". Сочетание редких лунных цветов создает гармоничный и романтичный букет`,
    imageUrl: './images/букет10.jfif',
    price: 440,
    type: 'flower',
  },

  // =====
  {
    id: 4,
    title: '',
    description: '',
    imageUrl: './images/игрушка.jfif',
    price: 550,
    type: 'gift',
  },
  {
    id: 5,
    title: '',
    description: '',
    imageUrl: './images/шары.jfif',
    price: 660,
    type: 'gift',
  },
  {
    id: 6,
    title: '',
    description: '',
    imageUrl: './images/открытки.jfif',
    price: 770,
    type: 'gift',
  },
]

class Store {
  items = []
  selected = []

  _onChange = undefined

  constructor(items, options) {
    this.items = items
    options.onInit({ items, selected: [] })

    this._onChange = options.onChange
  }

  add = (item) => {
    this.selected.push(prepareStoreIteamForCaret(item))
    this._onChange({ items: this.items, selected: this.selected })
  }

  remove = (item) => {
    const removeIndex = this.selected.findLastIndex(
      (s) => s.item.id === item.id
    )
    const leftPart = this.selected.slice(0, removeIndex)
    const rightPart = this.selected.slice(removeIndex + 1)
    this.selected = [...leftPart, ...rightPart]
    this._onChange({ items: this.items, selected: this.selected })
  }

  clearSelection = () => {
    this.selected = []
    this._onChange({ items: this.items, selected: this.selected })
  }
}

function prepareStoreIteamForCaret(item) {
  return {
    key: Date.now(),
    item,
  }
}

class Renderer {
  config = undefined
  store = undefined

  constructor(config, items) {
    this.config = config

    this.store = new Store(items, {
      onInit: (data) => this.update(data),
      onChange: (data) => this.update(data),
    })
  }

  update = ({ items, selected }) => {
    renderCaretCounter(selected)

    renderCaretContainer(selected, {
      onAdd: (i) => {
        this.store.add(i)
      },
      onRemove: (i) => {
        this.store.remove(i)
      },
      onClear: () => this.store.clearSelection(),
      onOrder: () => {
        const total =
          this.store.selected.reduce((acc, { item }) => acc + item.price, 0) ??
          0
        window.alert(
          `Мы приняли Ваш заказ на сумму ${total}₽. Мы свяжемся с вами когда заказ будет готов.`
        )
        this.store.clearSelection()
      },
    })

    renderFlowers(
      this.config,
      items.filter((item) => item.type === 'flower'),
      selected.filter(({ item }) => item.type === 'flower'),
      {
        onAdd: (i) => {
          this.store.add(i)
        },
        onRemove: (i) => {
          this.store.remove(i)
        },
      }
    )

    renderGifts(
      this.config,
      items.filter((item) => item.type === 'gift'),
      selected.filter(({ item }) => item.type === 'gift'),
      {
        onAdd: (i) => {
          this.store.add(i)
        },
        onRemove: (i) => {
          this.store.remove(i)
        },
      }
    )
  }
}

const config = {
  flowersSection: document.getElementById('flowers_section'),
  giftsSection: document.getElementById('gifts_section'),
}

const renderer = new Renderer(config, storeItems)

function renderFlowers(config, flowers, selected, options) {
  config.flowersSection.innerHTML = null
  flowers.map((item) => {
    const selectedCounter =
      selected?.filter((f) => f.item.id === item.id).length ?? 0
    const flower = getFlowerElementToRender(item, selectedCounter, options)
    config.flowersSection.appendChild(flower)
  })
}

function renderGifts(config, gifts, selected, options) {
  config.giftsSection.innerHTML = null
  gifts.map((item) => {
    const selectedCounter =
      selected?.filter((f) => f.item.id === item.id).length ?? 0
    const gift = getGiftElementToRender(item, selectedCounter, options)
    config.giftsSection.appendChild(gift)
  })
}

function renderCaretCounter(selected) {
  const counterElement = document.getElementById('caret_counter')
  if (counterElement == null) {
    console.error('Невозможно обновить счетчик корзины.')
    return
  }
  const total = selected?.reduce((acc, { item }) => acc + item.price, 0) ?? 0
  counterElement.innerText = `${total}₽`
}

function renderCaretContainer(selected, options) {
  const caretContainerElement = document.getElementById('caret_container')
  if (caretContainerElement == null) {
    console.error('Невозможно отрисовать корзину.')
    return
  }

  caretContainerElement.innerHTML = null

  const title = document.createElement('div')
  title.innerText = selected.length ? 'Корзина' : 'Корзина пуста'

  if (!selected.length) {
    caretContainerElement.append(title)
    return
  }

  const itemsContainer = document.createElement('div')
  itemsContainer.classList.add('caret_items')

  getUniqItems(selected).map((item) => {
    const counter =
      selected.filter((i) => i.item.id === item.item.id).length ?? 0

    itemsContainer.append(getCaretItemToRender(item, counter, options))
  })

  const total = document.createElement('div')
  total.classList.add('caret_item_price_total')
  total.innerText = `Итого: ${selected.reduce(
    (acc, i) => acc + i.item.price,
    0
  )}₽`

  const controls = document.createElement('div')
  controls.classList.add('caret_controls')

  const clearButton = document.createElement('button')
  clearButton.classList.add('caret_clear_button')
  clearButton.innerText = 'Очистить корзину'
  clearButton.addEventListener('click', () => options?.onClear())

  const orderButton = document.createElement('button')
  orderButton.classList.add('caret_order_button')
  orderButton.innerText = 'Оформить заказ'
  orderButton.addEventListener('click', () => options?.onOrder())

  controls.append(clearButton, orderButton)
  caretContainerElement.append(title, itemsContainer, total, controls)
}

function getUniqItems(items) {
  return items.reduce((acc, curr) => {
    if (!acc.some((i) => i.item.id === curr.item.id)) acc.push(curr)
    return acc
  }, [])
}

function getCaretItemToRender({ item }, selectedCounter, options) {
  console.log({ item })
  const root = document.createElement('div')
  root.classList.add('caret_item')
  const image = document.createElement('div')
  image.classList.add('caret_item_img')
  image.setAttribute('style', `background-image: url(${item.imageUrl});`)

  const controls = document.createElement('div')
  controls.classList.add('caret_item_controls')
  const price = document.createElement('div')
  price.classList.add('caret_item_price')
  price.innerText = `${item.price * selectedCounter}₽`
  const buttons = document.createElement('div')
  buttons.classList.add('caret_item_buttons')
  const minusButton = document.createElement('button')
  minusButton.classList.add('caret_item_minus_button')
  minusButton.innerText = '-'
  const counter = document.createElement('span')
  counter.innerText = selectedCounter
  const plusButton = document.createElement('button')
  plusButton.classList.add('caret_item_plus_button')
  plusButton.innerText = '+'
  plusButton.addEventListener('click', () => options?.onAdd(item))
  minusButton.addEventListener('click', () => options?.onRemove(item))

  buttons.append(minusButton, counter, plusButton)
  controls.append(price, buttons)
  root.append(image, controls)

  return root
}

function getFlowerElementToRender(item, selectedCounter, options) {
  if (item == null) {
    console.error('Не удалось отрисовать букет')
    return
  }

  const root = document.createElement('div')
  root.className = 'store_item'
  const content = document.createElement('div')
  content.classList.add('store_item_content')

  const image = document.createElement('img')
  image.classList.add('store_item_image')
  image.setAttribute('src', item.imageUrl)

  const description = document.createElement('p')
  description.classList.add('store_item_description')
  description.innerText = item.description

  const controls = document.createElement('div')
  controls.classList.add('store_item_controls')

  const price = document.createElement('span')
  price.innerText = `Цена: ${item.price}₽`

  const buttons = document.createElement('div')
  buttons.classList.add('store_item_buttons')
  if (selectedCounter < 1) {
    const addButton = document.createElement('button')
    addButton.classList.add('store_item_button')
    addButton.innerText = `Добавить`
    addButton.addEventListener('click', () => options?.onAdd(item))
    buttons.append(addButton)
  } else {
    const counter = document.createElement('span')
    counter.classList.add('store_item_counter')
    counter.innerText = selectedCounter
    const plusButton = document.createElement('button')
    const minusButton = document.createElement('button')
    plusButton.classList.add('store_item_plus_button')
    minusButton.classList.add('store_item_minus_button')
    plusButton.innerText = `+`
    minusButton.innerText = `-`
    plusButton.addEventListener('click', () => options?.onAdd(item))
    minusButton.addEventListener('click', () => options?.onRemove(item))
    buttons.append(minusButton, counter, plusButton)
  }

  content.append(image, description)
  controls.append(price, buttons)
  root.append(content, controls)

  return root
}

function getGiftElementToRender(item, selectedCounter, options) {
  if (item == null) {
    console.error('Не удалось отрисовать букет')
    return
  }

  const root = document.createElement('div')
  root.className = 'store_item'
  const content = document.createElement('div')
  content.classList.add('store_item_content')

  const image = document.createElement('img')
  image.classList.add('store_item_image')
  image.setAttribute('src', item.imageUrl)

  const description = document.createElement('p')
  description.classList.add('store_item_description')
  description.innerText = item.description

  const controls = document.createElement('div')
  controls.classList.add('store_item_controls')

  const price = document.createElement('span')
  price.innerText = `Цена: ${item.price}₽`

  const buttons = document.createElement('div')
  buttons.classList.add('store_item_buttons')
  if (selectedCounter < 1) {
    const addButton = document.createElement('button')
    addButton.classList.add('store_item_button')
    addButton.innerText = `Добавить`
    addButton.addEventListener('click', () => options?.onAdd(item))
    buttons.append(addButton)
  } else {
    const counter = document.createElement('span')
    counter.classList.add('store_item_counter')
    counter.innerText = selectedCounter
    const plusButton = document.createElement('button')
    const minusButton = document.createElement('button')
    plusButton.classList.add('store_item_plus_button')
    minusButton.classList.add('store_item_minus_button')
    plusButton.innerText = `+`
    minusButton.innerText = `-`
    plusButton.addEventListener('click', () => options?.onAdd(item))
    minusButton.addEventListener('click', () => options?.onRemove(item))
    buttons.append(minusButton, counter, plusButton)
  }

  content.append(image, description)
  controls.append(price, buttons)
  root.append(content, controls)

  return root
}
