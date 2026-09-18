import PlusIcon from '../components/ui/PlusIcon'
import ArrowIcons from '../components/ui/ArrowIcons';
import MenuIcon from '../components/ui/MenuIcon';
import { useEffect, useState } from 'react';
import ReportIcon from '../components/ui/ReportIcon';
import MinusIcon from '../components/ui/MinusIcon';
import DeleteIcon from '../components/ui/DeleteIcon';
import ArrowrightIcon from '../components/ui/ArrowrightIcon';
import CartIcon from '../components/ui/CartIcon';
import MusicIcon from '../components/ui/MusicIcon';
import SettingIcon from '../components/ui/SettingIcon';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clear, decrease, increase, remove } from '../store/cartSlice';
import { storeOrder } from '../services/orders';
import { storeOrderitem } from '../services/orderitems';
import { paywayPaymentService } from '../services/paywaypayments';
import HomeIcon from '../components/ui/HomeIcon';



function Cart() {
  const navigate = useNavigate();
  const dispath = useDispatch();
  const [isOrderType, setOrderType] = useState('Dine in');;
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    table: '',
  })
  const carts = useSelector(state => state.cart)
  const [total, setTotal] = useState(0);
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

  const toHome = () => {
    navigate('/')
  }

  const orderTypes = ['Dine in', 'Take Away', 'Order Online'];
  const selectOrderType = (ordertype) => {
    setOrderType(ordertype)
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
    if (orderForm.customer_name === '' || orderForm.table === '') {
      alert('Customer_name or Table required!')
      return;
    }

    if (carts.items.length === 0) {
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
      <div className='w-full pr-2'>
        <div className={`h-max bg-[#FFFFFF] top-3 rounded-3xl p-4 sticky w-full transition-all duration-300 ease-in-out `}>
          <div className='flex justify-between'>
            <button className='cursor-pointer rounded-full ' onClick={() => toHome()}>
              <div className='p-3 bg-[#025726] rounded-full'>
                <div className={`w-6 h-6 shrink-0 transition-all duration-300 ease-in-out`}>
                  <HomeIcon></HomeIcon>
                </div>
              </div>
            </button>
            <div className={`mt-1  overflow-hidden`}>
              <div className='whitespace-nowrap hidden lg:block'>Pruchesase Receipt</div>
              <div className='whitespace-nowrap block lg:hidden'>Receipt</div>
            </div>
            <button className={`cursor-pointer rounded-full overflow-hidden`}>
              <div className='p-3 border border-[#025726] rounded-full'>
                <div className='w-6 h-6 shrink-0'>
                  <MenuIcon></MenuIcon>
                </div>
              </div>
            </button>
          </div>

          <div className={`flex-col xl:flex-row justify-between mt-4 rounded-3xl xl:rounded-full border border-[#025726] flex overflow-hidden`}>
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


          <div className={`flex-col gap-2 xl:flex-row justify-between mt-4 flex overflow-hidden`}>
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

          <div className={`w-full h-auto overflow-hidden`}>
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


          <div className={`mt-4 overflow-hidden`}>
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
        </div>
      </div>

      {
        qralert &&
        <div className='fixed w-full h-full top-0 left-0 bg-[rgba(255,255,255,0.10)] backdrop-blur-xs z-10 flex justify-center items-center px-2'>
          <div className='w-[90%] sm:w-120 h-120 bg-[#FFFFFF] p-4 flex flex-col justify-center rounded-2xl border border-[#025726]'>
            <div className='font-semibold text-center'>Payment amount</div>
            <div className='font-semibold text-center'>${qrCheckout?.payway?.amount}</div>
            <div className='text-[#555555] text-center'>Scan this code with ABA KHQR app to make payment</div>
            <div className='flex justify-center mt-5'>
              <div className='border w-50 h-50'>
                <img className='w-full h-full' src={qrCheckout?.payway?.qrImage} alt="" />
              </div>
            </div>
            <div className='text-center mt-5'>Processing payment</div>
            <div className='text-center mt-2'>QR code expired after <span className='font-semibold'>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span></div>
            <div className='flex justify-center '>
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

export default Cart