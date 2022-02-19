const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const path = 'bella_vue';

//定義規則
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

//加入多國語系
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      isLoading: false,
      cartData: {},
      products: [],
      productId: '',
      isLoadingItem: '',
      user: {
        // 電子郵件
        email: "",
        // 收件人姓名
        name: "",
        // 地址
        address: "",
        // 電話
        phone: "",
        // 留言
        msg: ''
      }
    };
  },
  methods: {
    getProducts(){
      this.isLoading = true;
      axios.get(`${apiUrl}/api/${path}/products/all`)
        .then((res) => {
          this.isLoading = false;
          this.products = res.data.products;
        })
        .catch((err) => {
          alert('取得產品列表失敗');
      });
    },
    openProductModal(id) {
      this.productId = id
      this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${apiUrl}/api/${path}/cart`)
        .then((res) => {
          this.cartData = res.data.data;
        })
        .catch((err) => {
          alert('取得購物車列表失敗');
      });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id : id,
        qty
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${path}/cart`, { data })
        .then((res) => {
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = ''
        })
        .catch((err) => {
          alert('加入購物車失敗');
      });
    },
    removeCartItem(id) {
      this.isLoadingItem = id
      axios.delete(`${apiUrl}/api/${path}/cart/${id}`)
        .then((res) => {
          this.getCart();
          this.isLoadingItem = '';
        })
    },
    updateCartItem(item) {
      const data = {
        product_id : item.id,
        qty: item.qty
      };
      this.isLoadingItem = item.id
      axios.put(`${apiUrl}/api/${path}/cart/${item.id}`, { data })
        .then((res) => {
          this.getCart();
          this.isLoadingItem = '';
        })
        .catch((err) => {
          alert('更新購物車失敗');
      });
    },
    // 電話檢核規則
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/
      return phoneNumber.test(value) ? true : '電話號碼應為09開頭'
    },
    // 送出表單
    onSubmit() {
        console.log(this.user);
        alert('表單送出');
        //重設表單
        this.$refs.form.resetForm();
    },
  },
    mounted() {
      this.getProducts();
      this.getCart();
    }
});

app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    }
  },
  watch: {
    id() {
      this.getProduct();
    }  
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${path}/product/${this.id}`)
        .then((res) => {
          this.product = res.data.product;
        })
        .catch((err) => {
          alert('取得產品失敗');
      });
    },
    addToCart(){
      this.$emit('add-cart', this.product.id, this.qty);
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
})

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);
app.component('Loading', VueLoading.Component);

app.mount('#app');