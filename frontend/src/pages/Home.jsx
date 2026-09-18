import SearchIcon from '../components/ui/SearchIcon'
import CoffeePic from '../assets/images/coffee.png'
import PlusIcon from '../components/ui/PlusIcon'
import ArrowIcons from '../components/ui/ArrowIcons';
import MenuIcon from '../components/ui/MenuIcon';
import { useEffect, useState } from 'react';
import ReportIcon from '../components/ui/ReportIcon';
import MinusIcon from '../components/ui/MinusIcon';
import DeleteIcon from '../components/ui/DeleteIcon';
import ArrowrightIcon from '../components/ui/ArrowrightIcon';
import CartIcon from '../components/ui/CartIcon';
import CoffeeIcon from '../components/ui/CoffeeIcon';
import TeaIcon from '../components/ui/TeaIcon';
import SnackIcon from '../components/ui/SnackIcon';
import MusicIcon from '../components/ui/MusicIcon';
import SettingIcon from '../components/ui/SettingIcon';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addCart, clear, decrease, increase, remove } from '../store/cartSlice';
import { getCategories } from '../services/categores';
import { getAllProducts, getProducts, showProduct } from '../services/products';
import { storeOrder } from '../services/orders';
import { storeOrderitem } from '../services/orderitems';
import { paywayPaymentService } from '../services/paywaypayments';


function Home() {
  const [menuOpen, setMenuOpen] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const dispath = useDispatch();
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [addProductPopup, setAddProductPopup] = useState(false);
  const [isSort, setSort] = useState(1);
  const [isOrderType, setOrderType] = useState('Dine in');
  const [showProdct, setShowProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [form, setFrom] = useState({
    sugar: 'Less Sugar',
    size: 'Small Size',
  });
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    table: '',
  })
  const carts = useSelector(state => state.cart)
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allproducts, setallProducts] = useState([]);
  const [search, setSearch] = useState('');
  const tax = 4.9

  // aba and qr generate 
  const [qrCheckout, setQrCheckout] = useState(null);

  const [payment, setPayment] = useState("qr");
  const [qralert, setqralert] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600)

  useEffect(() => {
    if (!qrCheckout) return;

    setTimeLeft(600);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCheckout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  useEffect(() => {
    let sum = 0;

    carts.items.forEach(item => {
      sum += Number(item.product_price) * Number(item.quantity)
    });

    setTotal(sum);
  }, [carts.items])


  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const toggleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    const handleResize = () => {
      setMenuOpen(window.innerWidth < 768)
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, []);

  const toCart = () => {
    navigate('/cart')
  }

  useEffect(() => {
    fetchCategories();
    fetchAllProduct();

  }, [])

  useEffect(() => {
    fetchProduct(isSort, search)
  }, [search, isSort])


  const fetchAllProduct = async () => {
    const data = await getAllProducts();
    setallProducts(data.data);
  }

  const fetchProduct = async (id, search) => {
    try {
      setLoadingProduct(true);
      const data = await getProducts(id, search);
      setProducts(data.data)
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingProduct(false);
    }
  }


  const fetchCategories = async () => {
    try {
      setLoadingCategory(true)
      const data = await getCategories();
      setCategories(data.data)
    }
    catch (err) {
      console.log(err)
    } finally {
      setLoadingCategory(false)
    }
  }

  const selectSort = async (id) => {
    setSort(id)
  }

  const orderTypes = ['Dine in', 'Take Away', 'Order Online'];

  const selectOrderType = (ordertype) => {
    setOrderType(ordertype)
  }

  const toggleAddProduct = async (id) => {
    // const result = products.find((produt) => produt.id === id);
    const data = await showProduct(id);
    console.log(data.data);
    setShowProduct(data.data);
    setAddProductPopup(!addProductPopup);
  }


  const addToCart = () => {
    const item = {
      product_id: showProdct.id,
      image: showProdct.image,
      product_name: showProdct.name,
      product_category: showProdct.category.name,
      product_price: showProdct.price,
      quantity: quantity,
      sugar: form.sugar,
      size: form.size,
    }
    dispath(addCart(item));
    setQuantity(1)
    setAddProductPopup(false)
  }

  const editIncrease = (id) => {
    dispath(increase(id))
  }

  const editDecrease = (id) => {
    dispath(decrease(id))
  }

  const removeCart = (id) => {
    dispath(remove(id));
  }

  const order = async () => {
    if(orderForm.customer_name === '' || orderForm.table === ''){
      alert('Customer_name or Table required!')
      return;
    }

    if(carts.items.length === 0){
      alert('No item!')
      return;
    }
    const orderRecipt = {
      order_type: isOrderType,
      customer_name: orderForm.customer_name,
      table: orderForm.table,
      payment_method: payment,
      line_total: total,
      total: total + tax
    }

    const orderResponse = await storeOrder(orderRecipt);
    const orderid = orderResponse.data.id;

    const paymentResponse = await paywayPaymentService.get(orderid);

    setQrCheckout(paymentResponse);

    setqralert(!qralert)
  }

  useEffect(() => {
    if (timeLeft === 0 && qrCheckout) {
      paywayPaymentService.fail(qrCheckout.order_id);

      setQrCheckout(null);
      setqralert(false);
    }
  }, [timeLeft, qrCheckout]);

  useEffect(() => {
    if (!qrCheckout) return;

    const timer = setInterval(async () => {
      const response = await paywayPaymentService.status(
        qrCheckout.order_id
      );

      console.log(response);

      if (response.status === "paid") {
        clearInterval(timer);

        const orderItem = {
          order_id: qrCheckout.order_id,
          items: carts.items
        };

        console.log(orderItem)

        await storeOrderitem(orderItem);

        dispath(clear());

        setQrCheckout(null);
        setqralert(false);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [qrCheckout]);

  const closeQr = async () => {

    if (qrCheckout) {
      await paywayPaymentService.fail(qrCheckout.order_id);
    }

    dispath(clear());
    setOrderForm({
      customer_name: '',
      table: '',
    })
    setqralert(false);
    setQrCheckout(null);
  }


  return (
    <>
      <div className='flex justify-between gap-4'>
        <div className={`w-full`} >
          <div className='border border-[#025726] h-11 rounded-full bg-[#FFFFFF] flex items-center px-3'>
            <div className='w-6 h-6 shrink-0'>
              <SearchIcon></SearchIcon>
            </div>
            <input value={search} onChange={(e) => { setSearch(e.target.value) }} type="text" className='w-full h-full roudend-full outline-none ' placeholder='Search' />
          </div>
          {
            loadingCategory === true ?
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4'>
                <button className='cursor-pointer'>
                  <div className={` w-full p-4 rounded-3xl flex flex-col items-start relative overflow-hidden text-[#FFFFFF] bg-[#EBEBEB]`}>
                    <div className={`border  w-max h-max px-7 py-1 bg-[#FFFFFF]`}>
                      <div className='text-[12px] text-[#00000]'>Available</div>
                    </div>

                    <div className='mt-7'>
                      <div className=' text-2xl  text-left bg-[#FFFFFF]'>
                        name
                      </div>
                      <div className='w-max bg-[#FFFFFF]'>
                        items
                      </div>
                    </div>

                    <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30 bg-[#FFFFFF]'>
                      <CoffeeIcon className={`fill-[#FFFFFF]`}></CoffeeIcon>
                    </div>
                  </div>
                </button>
                <button className='cursor-pointer'>
                  <div className={` w-full p-4 rounded-3xl flex flex-col items-start relative overflow-hidden text-[#FFFFFF] bg-[#EBEBEB]`}>
                    <div className={`border  w-max h-max px-7 py-1 bg-[#FFFFFF]`}>
                      <div className='text-[12px] text-[#00000]'>Available</div>
                    </div>

                    <div className='mt-7'>
                      <div className=' text-2xl  text-left bg-[#FFFFFF]'>
                        name
                      </div>
                      <div className='w-max bg-[#FFFFFF]'>
                        items
                      </div>
                    </div>

                    <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30 bg-[#FFFFFF]'>
                      <TeaIcon className={`fill-[#FFFFFF]`}></TeaIcon>
                    </div>
                  </div>
                </button>
                <button className='cursor-pointer'>
                  <div className={` w-full p-4 rounded-3xl flex flex-col items-start relative overflow-hidden text-[#FFFFFF] bg-[#EBEBEB]`}>
                    <div className={`border  w-max h-max px-7 py-1 bg-[#FFFFFF]`}>
                      <div className='text-[12px] text-[#00000]'>Available</div>
                    </div>

                    <div className='mt-7'>
                      <div className=' text-2xl  text-left bg-[#FFFFFF]'>
                        name
                      </div>
                      <div className='w-max bg-[#FFFFFF]'>
                        items
                      </div>
                    </div>

                    <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30 bg-[#FFFFFF]'>
                      <SnackIcon className={`fill-[#FFFFFF]`}></SnackIcon>
                    </div>
                  </div>
                </button>
              </div>
              :
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4'>
                {
                  categories.map((categorie) =>
                    <button key={categorie.id} className='cursor-pointer' onClick={() => selectSort(categorie.id)}>
                      <div className={` w-full p-4 rounded-3xl flex flex-col items-start relative overflow-hidden ${categorie.id === isSort ? 'bg-[#025726] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}`}>
                        {
                          allproducts.filter((product) => product.category.id === categorie.id).length < 5 ? (<div className='  bg-[#FF090C] rounded-full w-max h-max px-7 py-1'>
                            <div className='text-[12px] text-[#FFFFFF]'>Need to re-stock</div>
                          </div>

                          ) : (
                            <div className={`border border-[#000000] rounded-full w-max h-max px-7 py-1 ${categorie.id === isSort ? 'border-[#FFFFFF]' : 'border-[#000000]'}`}>
                              <div className='text-[12px] text-[#00000]'>Available</div>
                            </div>
                          )
                        }

                        <div className='mt-7'>
                          <div className=' text-2xl  text-left'>
                            {categorie.name}
                          </div>
                          <div className='w-max'>
                            {allproducts.filter((product) => product.category.id === categorie.id).length} items
                          </div>
                        </div>
                        {
                          categorie.name === "Coffee" ? (
                            <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30'>
                              <CoffeeIcon className={` ${categorie === isSort ? 'fill-[#FFFFFF]' : 'fill-[#EBEBEB]'}`}></CoffeeIcon>
                            </div>
                          ) : categorie.name === "Tea" ? (
                            <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30'>
                              <TeaIcon className={` ${categorie === isSort ? 'fill-[#FFFFFF]' : 'fill-[#EBEBEB]'}`}></TeaIcon>
                            </div>
                          ) : (
                            <div className='w-30 h-30 absolute -bottom-6 right-0 -rotate-30'>
                              <SnackIcon className={` ${categorie === isSort ? 'fill-[#FFFFFF]' : 'fill-[#EBEBEB]'}`}></SnackIcon>
                            </div>
                          )
                        }
                      </div>
                    </button>
                  )
                }
              </div>
          }

          {
            loadingProduct ?

              <div className='grid grid-cols-1 sm:grid-cols-2
           md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4 gap-2 '>
                <div className='w-full h-full border border-[#EBEBEB] bg-[#EBEBEB] rounded-3xl p-4'>
                  <div className='w-full flex justify-center bg-[#FFFFFF]'>
                    <div className='w-50 h-50 shrink-0 p-4'>

                    </div>
                  </div>
                  <div className='flex justify-between mt-2 '>
                    <div className='mt-0.5'>
                      <div className='font-semibold line-clamp-1 bg-[#FFFFFF] text-[#FFFFFF]'>name</div>
                      <div className='text-sm  bg-[#FFFFFF] text-[#FFFFFF]'>$price</div>
                    </div>
                    <button className='cursor-pointer rounded-full  bg-[#FFFFFF]'>
                      <div className='p-3   rounded-full group bg-[#FFFFFF]'>
                        <div className='w-6 h-6 shrink-0'>
                          <PlusIcon className=" fill-[#FFFFFF]" ></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className='w-full h-full border border-[#EBEBEB] bg-[#EBEBEB] rounded-3xl p-4'>
                  <div className='w-full flex justify-center bg-[#FFFFFF]'>
                    <div className='w-50 h-50 shrink-0 p-4'>

                    </div>
                  </div>
                  <div className='flex justify-between mt-2 '>
                    <div className='mt-0.5'>
                      <div className='font-semibold line-clamp-1 bg-[#FFFFFF] text-[#FFFFFF]'>name</div>
                      <div className='text-sm  bg-[#FFFFFF] text-[#FFFFFF]'>$price</div>
                    </div>
                    <button className='cursor-pointer rounded-full  bg-[#FFFFFF]'>
                      <div className='p-3   rounded-full group bg-[#FFFFFF]'>
                        <div className='w-6 h-6 shrink-0'>
                          <PlusIcon className=" fill-[#FFFFFF]" ></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className='w-full h-full border border-[#EBEBEB] bg-[#EBEBEB] rounded-3xl p-4'>
                  <div className='w-full flex justify-center bg-[#FFFFFF]'>
                    <div className='w-50 h-50 shrink-0 p-4'>

                    </div>
                  </div>
                  <div className='flex justify-between mt-2 '>
                    <div className='mt-0.5'>
                      <div className='font-semibold line-clamp-1 bg-[#FFFFFF] text-[#FFFFFF]'>name</div>
                      <div className='text-sm  bg-[#FFFFFF] text-[#FFFFFF]'>$price</div>
                    </div>
                    <button className='cursor-pointer rounded-full  bg-[#FFFFFF]'>
                      <div className='p-3   rounded-full group bg-[#FFFFFF]'>
                        <div className='w-6 h-6 shrink-0'>
                          <PlusIcon className=" fill-[#FFFFFF]" ></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className='w-full h-full border border-[#EBEBEB] bg-[#EBEBEB] rounded-3xl p-4'>
                  <div className='w-full flex justify-center bg-[#FFFFFF]'>
                    <div className='w-50 h-50 shrink-0 p-4'>

                    </div>
                  </div>
                  <div className='flex justify-between mt-2 '>
                    <div className='mt-0.5'>
                      <div className='font-semibold line-clamp-1 bg-[#FFFFFF] text-[#FFFFFF]'>name</div>
                      <div className='text-sm  bg-[#FFFFFF] text-[#FFFFFF]'>$price</div>
                    </div>
                    <button className='cursor-pointer rounded-full  bg-[#FFFFFF]'>
                      <div className='p-3   rounded-full group bg-[#FFFFFF]'>
                        <div className='w-6 h-6 shrink-0'>
                          <PlusIcon className=" fill-[#FFFFFF]" ></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className='w-full h-full border border-[#EBEBEB] bg-[#EBEBEB] rounded-3xl p-4'>
                  <div className='w-full flex justify-center bg-[#FFFFFF]'>
                    <div className='w-50 h-50 shrink-0 p-4'>

                    </div>
                  </div>
                  <div className='flex justify-between mt-2 '>
                    <div className='mt-0.5'>
                      <div className='font-semibold line-clamp-1 bg-[#FFFFFF] text-[#FFFFFF]'>name</div>
                      <div className='text-sm  bg-[#FFFFFF] text-[#FFFFFF]'>$price</div>
                    </div>
                    <button className='cursor-pointer rounded-full  bg-[#FFFFFF]'>
                      <div className='p-3   rounded-full group bg-[#FFFFFF]'>
                        <div className='w-6 h-6 shrink-0'>
                          <PlusIcon className=" fill-[#FFFFFF]" ></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
              :
              <div className='grid grid-cols-1 sm:grid-cols-2
           md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4 gap-2 '>
                {
                  products.map((product) =>
                    <div className='w-full h-full border border-[#025726] bg-[#FFFFFF] rounded-3xl p-4' key={product.id}>
                      <div className='w-full flex justify-center'>
                        <div className='w-50 h-50 shrink-0 p-4'>
                          <img className='w-full h-full object-contain' src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`} alt="" />
                        </div>
                      </div>
                      <div className='flex justify-between mt-2'>
                        <div className='mt-0.5'>
                          <div className='font-semibold line-clamp-1'>{product.name}</div>
                          <div className='text-sm text-[#555555]'>${product.price}</div>
                        </div>
                        <button className='cursor-pointer rounded-full' onClick={() => toggleAddProduct(product.id)}>
                          <div className='p-3 border border-[#025726] rounded-full group hover:bg-[#025726]'>
                            <div className='w-6 h-6 shrink-0'>
                              <PlusIcon className="group-hover:fill-[#FFFFFF] fill-[#000000]" ></PlusIcon>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )
                }
              </div>
          }

          {
            addProductPopup && (
              <div className='fixed w-full h-full top-0 left-0 bg-[rgba(255,255,255,0.10)] backdrop-blur-xs z-10 flex justify-center items-center px-2'>
                <div className='w-full md:w-[80%] h-max bg-[#FFFFFF] p-4 rounded-3xl border border-[#025726] flex flex-col md:flex-row gap-4 relative'>
                  <div className='h-auto w-full md:w-50 bg-[#F4F2E3] flex justify-center items-center rounded-2xl shrink-0 p-4'>
                    <img className='w-50 h-50 object-contain' src={`${import.meta.env.VITE_IMAGE_URL}/${showProdct.image}`} alt="" />
                  </div>
                  <div className='w-full'>
                    <div className='mt-0 md:mt-2'>{showProdct.name ?? ''}</div>
                    <div className='text-4xl mt-1'>${showProdct.price ?? ''}</div>

                    <div className='w-full'>
                      <div className='text-[12px] mt-4'>Drink-Option</div>
                      <div className='grid grid-cols-1 md:grid-cols-2 w-full bg gap-2'>
                        <div className='w-full'>
                          <label htmlFor="" className='text-[12px] text-[#555555]'>Sugar</label>
                          <div className='border border-[#025726] rounded-full w-full group h-11 px-2'>
                            <select name="sugar" id="" className='w-full outline-0 h-full' value={form.sugar} onChange={(e) => setFrom({ ...form, sugar: e.target.value })}>
                              <option value="Less Sugar">Less Sugar</option>
                              <option value="Normal Sugar">Normal Sugar</option>
                              <option value="Max Sugar">Max Sugar</option>
                            </select>
                          </div>
                        </div>
                        <div className='w-full'>
                          <label htmlFor="" className='text-[12px] text-[#555555]'>Size</label>
                          <div className='border border-[#025726] rounded-full w-full group h-11 px-2'>
                            <select name="size" id="" className='w-full outline-0 h-full pl-1' value={form.size} onChange={(e) => setFrom({ ...form, size: e.target.value })}>
                              <option value="Small Size">Small Size</option>
                              <option value="Medium Size">Medium Size</option>
                              <option value="Large Size">Large Size</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 w-full bg gap-2 mt-2'>
                        <div className='w-full'>
                          <label htmlFor="" className='text-[12px] text-[#555555]'>Quantity</label>
                          <div className='bg-[#EBEBEB] flex gap-4 px-1 py-1 rounded-full h-11 justify-between items-center'>
                            <button className='cursor-pointer' onClick={decreaseQuantity}>
                              <div className='bg-[#FFFFFF] w-9 h-9 rounded-full flex justify-center items-center shrink-0'>
                                <div className='w-4 h-4'>
                                  <MinusIcon></MinusIcon>
                                </div>
                              </div>
                            </button>
                            <div className='text-[16px]'>{quantity}</div>
                            <button className='cursor-pointer' onClick={increaseQuantity}>
                              <div className='bg-[#FFFFFF] w-9 h-9 rounded-full flex justify-center items-center shrink-0'>
                                <div className='w-4 h-4'>
                                  <PlusIcon className='fill-[#000000]'></PlusIcon>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                        <div className='hidden md:block'></div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 w-full bg gap-2 mt-2'>
                        <div className='hidden md:block'></div>
                        <div className='mt-2 '>
                          <button className='cursor-pointer rounded-full w-full' onClick={() => addToCart()}>
                            <div className='p-1 h-12 bg-[#025726] rounded-full flex flex-row justify-between relative items-center'>
                              <div className='w-6 h-6 ml-2'>
                                <CartIcon className='fill-[#FFFFFF]'></CartIcon>
                              </div>

                              <div className='text-[#FFFFFF] absolute top-[50%] translate-y-[-50%] right-[50%] translate-x-[50%] '>
                                Add to Cart
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className='absolute -top-5 -right-1 md:-right-5'>
                    <button className='cursor-pointer rounded-full' onClick={() => setAddProductPopup(false)}>
                      <div className='p-3 bg-[#025726] rounded-full'>
                        <div className={`w-6 h-6 shrink-0 transition-all duration-300 ease-in-out rotate-45`}>
                          <PlusIcon className='fill-[#FFFFFF]'></PlusIcon>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )
          }


        </div>

        <div className={`h-max bg-[#FFFFFF] top-3 rounded-l-3xl p-4 sticky ${menuOpen ? 'w-19' : 'w-19 md:w-120'} transition-all duration-300 ease-in-out `}>
          <div className='flex justify-between'>
            <button className='cursor-pointer rounded-full hidden md:block' onClick={() => toggleMenuOpen()}>
              <div className='p-3 bg-[#025726] rounded-full'>
                <div className={`w-6 h-6 shrink-0 ${menuOpen ? 'rotate-180' : 'rotate-0'} transition-all duration-300 ease-in-out`}>
                  <ArrowIcons></ArrowIcons>
                </div>
              </div>
            </button>
            <div className={`mt-1  ${menuOpen ? 'hidden' : 'block'} overflow-hidden`}>
              <div className='whitespace-nowrap hidden lg:block'>Pruchesase Receipt</div>
              <div className='whitespace-nowrap block lg:hidden'>Receipt</div>
            </div>
            <button className={`cursor-pointer rounded-full ${menuOpen ? 'hidden' : 'block'} overflow-hidden`}>
              <div className='p-3 border border-[#025726] rounded-full'>
                <div className='w-6 h-6 shrink-0'>
                  <MenuIcon></MenuIcon>
                </div>
              </div>
            </button>
          </div>

          <div className={`flex-col xl:flex-row justify-between mt-4 rounded-3xl xl:rounded-full border border-[#025726]  ${menuOpen ? 'hidden' : 'md:flex '} overflow-hidden`}>
            {
              orderTypes.map((orderType, index) => {
                return (
                  <button key={index} className='cursor-pointer' onClick={() => selectOrderType(orderType)}>
                    <div className={`p-3  bg-transparen rounded-full lg:w-full xl:w-30 group ${isOrderType === orderType ? 'bg-[#025726]' : 'bg-transparen'}`}>
                      <div className={` whitespace-nowrap text-[12px] ${isOrderType === orderType ? 'text-[#FFFFFF]' : 'text-[#555555]'}`}>{orderType}</div>
                    </div>
                  </button>
                )
              })
            }
          </div>


          <div className={`flex-col gap-2 xl:flex-row justify-between mt-4  ${menuOpen ? 'hidden' : 'md:flex '} overflow-hidden`}>
            <div className='w-full'>
              <label htmlFor="" className='text-[12px] text-[#555555]'>Customer name</label>
              <div className='border border-[#025726] rounded-full w-full group h-11 px-2'>
                <input type="text" className='w-full outline-0 pl-1 h-full' value={orderForm.customer_name} onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })} />
              </div>
            </div>
            <div className='w-full'>
              <label htmlFor="" className='text-[12px] text-[#555555]'>Table</label>
              <div className='border border-[#025726] rounded-full w-full group h-11 px-2'>
                <select name="table" id="" className='w-full outline-0 h-full pl-1' value={orderForm.table} onChange={(e) => setOrderForm({ ...orderForm, table: e.target.value })} >
                  <option value="">Select table</option>
                  <option value="B12-Indoor">B12-Indoor</option>
                  <option value="B13-Indoor">B13-Indoor</option>
                  <option value="B14-Indoor">B14-Indoor</option>
                  <option value="B15-Indoor">B15-Outdoor</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`w-full h-auto  ${menuOpen ? 'hidden' : 'block'} overflow-hidden`}>
            <div className='text-[12px] text-[#555555] mt-4'>Order list</div>
            <div className={` rounded-3xl p-4 border border-[#025726] h-auto`}>
              <div className='w-full flex flex-col gap-2'>
                {
                  carts.items.length === 0 ? (
                    <div className='flex gap-2 items-center'>
                      <div className={`w-6 h-6  transition-all duration-300 ease-in-out`}>
                        <CartIcon className='fill-[#000000]'></CartIcon>
                      </div>
                      <div>
                        No item display!
                      </div>
                    </div>
                  ) : (
                    carts.items.map((cart) =>
                      <div key={cart.product_id} className='flex h-max flex-col lg:flex-row w-full justify-between md:gap-2 lg:gap-0 '>
                        <div className='flex gap-2'>
                          <div className='bg-[#F4F2E3] w-20 h-20 rounded-2xl p-1'>
                            <img className='w-full h-full object-contain' src={`${import.meta.env.VITE_IMAGE_URL}/${cart.image}`} alt="" />
                          </div>
                          <div className='flex flex-col justify-between'>
                            <div>
                              <div className='font-semibold whitespace-nowrap'>{cart.product_name}</div>
                              <div className='text-[12px] text-[#555555] whitespace-nowrap'>${cart.product_price} x{cart.quantity} - {cart.size}</div>
                            </div>
                            <div className='flex gap-1 items-center'>
                              <div className='w-5 h-5'>
                                <ReportIcon></ReportIcon>
                              </div>
                              <div className='text-[12px] text-[#555555]'>{cart.sugar}</div>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-row lg:flex-col justify-between items-end'>
                          <div className='font-semibold'>${cart.product_price}</div>
                          <div className=' flex flex-row  gap-2 items-end justify-center'>
                            <div className='bg-[#EBEBEB] flex gap-4 px-1 py-1 rounded-full'>
                              <button className='cursor-pointer' onClick={() => editDecrease(cart.product_id)}>
                                <div className='bg-[#FFFFFF] w-5 h-5 rounded-full flex justify-center items-center shrink-0'>
                                  <div className='w-3 h-3'>
                                    <MinusIcon></MinusIcon>
                                  </div>
                                </div>
                              </button>
                              <div className='text-[12px]'>{cart.quantity}</div>
                              <button className='cursor-pointer' onClick={() => editIncrease(cart.product_id)}>
                                <div className='bg-[#FFFFFF] w-5 h-5 rounded-full flex justify-center items-center shrink-0'>
                                  <div className='w-3 h-3'>
                                    <PlusIcon className='fill-[#000000]'></PlusIcon>
                                  </div>
                                </div>
                              </button>
                            </div>

                            <div className='bg-[#EBEBEB] flex gap-4 px-1 py-1 rounded-full'>
                              <button className='cursor-pointer' onClick={() => removeCart(cart.product_id)} >
                                <div className='bg-[#FFFFFF] w-5 h-5 rounded-full flex justify-center items-center shrink-0'>
                                  <div className='w-3 h-3'>
                                    <DeleteIcon></DeleteIcon>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                }

              </div>
            </div>
          </div>


          <div className={`mt-4 overflow-hidden  ${menuOpen ? 'hidden' : 'block'}`}>
            <div className='font-semibold'>
              Payment Details
            </div>

            <div className='flex w-full justify-between mt-1'>
              <div className='text-[#555555] text-[12px]'>
                Subtotal
              </div>
              <div className='font-semibold'>
                ${total.toFixed(2)}
              </div>
            </div>

            <div className='flex w-full justify-between mt-1'>
              <div className='text-[#555555] text-[12px]'>
                Tax
              </div>
              <div className='font-semibold'>
                {
                  carts.items.length === 0 ? `$0.00` : `$${tax.toFixed(2)}`
                }
              </div>
            </div>

            <div className='flex w-full justify-between mt-2'>
              <div className='text-[#555555] text-[12px]'>
                Total
              </div>
              <div className='font-semibold'>
                {
                  carts.items.length === 0 ? `$${total.toFixed(2)}` : `$${(total + tax).toFixed(2)}`
                }
              </div>
            </div>

            <div className='mt-2'>
              <button className='cursor-pointer rounded-full w-full'>
                <div className='p-1 h-12 bg-[#025726] rounded-full flex flex-row justify-between relative' onClick={() => order()}>
                  <div className='bg-[#FFFFFF] rounded-full shrink-0 w-10 h-10 flex justify-center items-center'>
                    <div className={`w-6 h-6  transition-all duration-300 ease-in-out`}>
                      <ArrowrightIcon className='fill-[#025726]'></ArrowrightIcon>
                    </div>
                  </div>

                  <div className='text-[#FFFFFF] absolute top-[50%] translate-y-[-50%] right-[50%] translate-x-[50%] '>
                    {
                      carts.items.length === 0 ? `Place Order $${total.toFixed(2)}` : `Place Order $${(total + tax).toFixed(2)}`
                    }
                  </div>

                  <div className='relative w-15 h-10'>
                    <div className={`w-6 h-6 shrink-0  absolute top-[50%] translate-y-[-50%] right-0`}>
                      <ArrowIcons></ArrowIcons>
                    </div>
                    <div className={`w-6 h-6 shrink-0  absolute top-[50%] translate-y-[-50%] right-[15%] opacity-80`}>
                      <ArrowIcons></ArrowIcons>
                    </div>
                    <div className={`w-6 h-6 shrink-0  absolute top-[50%] translate-y-[-50%] right-[30%] opacity-40`}>
                      <ArrowIcons></ArrowIcons>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>


          <div className='block md:hidden'>
            <button className='cursor-pointer rounded-full w-max' onClick={() => toCart()}>
              <div className='p-1 h-12 bg-[#025726] rounded-full flex flex-row justify-between relative'>
                <div className='bg-[#FFFFFF] rounded-full shrink-0 w-10 h-10 flex justify-center items-center'>
                  <div className={`w-6 h-6  transition-all duration-300 ease-in-out`}>
                    <CartIcon className='fill-[#025726]'></CartIcon>
                  </div>
                </div>
                <div className='absolute w-5 h-5 bg-[#FF090C] right-0 -top-1 rounded-full'>
                  <div className='text-[#FFFFFF] text-[12px] '>
                    {carts.items.length}
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className='block md:hidden mt-2'>
            <button className='cursor-pointer rounded-full'>
              <div className='p-3 bg-[#025726] rounded-full'>
                <div className={`w-6 h-6 shrink-0 rotate-180 transition-all duration-300 ease-in-out`}>
                  <MusicIcon></MusicIcon>
                </div>
              </div>
            </button>
          </div>

          <div className='block md:hidden mt-1'>
            <button className='cursor-pointer rounded-full'>
              <div className='p-3 bg-[#025726] rounded-full'>
                <div className={`w-6 h-6 shrink-0 rotate-180 transition-all duration-300 ease-in-out`}>
                  <SettingIcon></SettingIcon>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {
        qralert &&
        <div className='fixed w-full h-full top-0 left-0 bg-[rgba(255,255,255,0.10)] backdrop-blur-xs z-10 flex justify-center items-center px-2'>
          <div className='w-[90%] sm:w-120 h-120 bg-[#FFFFFF] p-4 flex flex-col justify-center rounded-2xl border border-[#025726]'>
            <div className='font-semibold text-center'>Payment amount</div>
            <div className='font-semibold text-center mt-2'>${qrCheckout?.payway?.amount}</div>
            <div className='text-[#555555] text-center'>Scan this code with ABA KHQR app to make payment</div>
            <div className='flex justify-center mt-5'>
              <div className='border w-50 h-50'>
                <img className='w-full h-full' src={qrCheckout?.payway?.qrImage} alt="" />
              </div>
            </div>
            <div className='text-center mt-5'>Processing payment</div>
            <div className='text-center mt-2'>QR code expired after <span className='font-semibold'>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span></div>
            <div className='flex justify-center mt-1'>
              <button className='bg-[#025726] px-12 py-2 text-[#FFFFFF] mt-2 cursor-pointer rounded-full' onClick={() => closeQr()}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      }

    </>
  )
}

export default Home