const App = new Vue({
  el: "#app",
  data: {
    validate: false, // Modo de validacion
    visible: false, // Visible o no Loading
    currentstep: 1, // Primer steps visible
    steps: [
      { id: 1, title: "Destino", icon_class: "fa fa-globe" },
      { id: 2, title: "Coberturas", icon_class: "fa fa-list-ul" },//th-list
      { id: 3, title: "Reservar", icon_class: "fa fa-credit-card" }
    ],

    // Los valores que se alamancenan en los imputs del paso1
    oStep1 : { destino:"", fecha_partida:"", fecha_retorno:"", cantidad_pasajeros:0 },

    // Respuesta Ajax para poder pintar los planes cotizacion del paso2
    oCoberturas: [],
    
    selectedValue: "", // Valor seleccionado 
    options: [] // Valores del select (se llena con ajax)
  },
  // components: { Loading: VueLoading },
  methods: {

    // Loading testing metodos --------------------------------------------------------------
    loadingOpen() {
        console.log('open was clicked, will auto hide');
        let loader = this.$loading.show({ loader: 'dots' });
        setTimeout(() => loader.hide(), 3 * 1000)
    },
    loadingShow() {
        console.log('show was clicked, click to hide');
        this.visible = true
    },
    // Step Wizard Metodos ------------------------------------------------------------------
    // @step type int tab que sigue
    stepChanged(step) {
      console.log("antes set -> stepChanged:",step);

      // Si se quiere pasar al paso2
      if(step == 2) {
        // Validando que estee todo llenado
        if( !this.isValidStep1(this.oStep1) ) { return false; }
        //console.log("step2->this.oStep1:",this.oStep1);
        let oSendStep1 = _.clone(this.oStep1); //Guardando una copia para enviar por ajax
        oSendStep1.destino = oSendStep1.destino.value // customizando la copia
        let loader = this.$loading.show(); // Mostrando Loading

        this.getCotizacion(oSendStep1, this, () => {
            loader.hide();
            this.currentstep = step;
        });

      } else {
        this.currentstep = step;
      }

    },
    
    // Validacion del form del paso 1
    isValidStep1 (oStep1) {
        this.validate = false;
        for(let i in oStep1) {
          console.log(i+")",oStep1[i]);
          if( !(oStep1[i]!=="" && oStep1[i]!==0 && oStep1[i]!==undefined && oStep1[i]!==null) ) {
            this.validate = true;
            break;
          }
        }
        return !this.validate;
    },

    // Select Ajax Metodos ------------------------------------------------------------------
    onSearch(search, loading) {
      loading(true);
      this.search(loading, search, this);
    },

    getCotizacion: _.debounce((oStep1, _this, fncNextStep) => {

      var headers = new Headers({ "Content-Type": "application/json" });
      var initial = { method:"POST", body: JSON.stringify(oStep1), headers:headers, mode:"cors", cache:"default" };

      //var endPoint = `https://testsoat.interseguro.com.pe/talentfestapi/cotizacion`;
      var endPoint = `http://qdstest.laravel.local/api/destinos`;

      fetch(endPoint, initial).then(res => {
        res.json().then(json => {

            console.log ("ajax res:", json);
            _this.oCoberturas = json;
            fncNextStep();            
        });
      });
        
    }, 350),

    search: _.debounce((loading, search, vm) => {

      var headers = new Headers({ "Content-Type": "application/json" });
      var initial = { method:"GET", headers:headers, mode:"cors", cache:"default" };

      //var endPoint = `https://testsoat.interseguro.com.pe/talentfestapi/destinos/${escape(search)}`;
      var endPoint = `http://qdstest.laravel.local/api/destinos/${escape(search)}`;

      fetch(endPoint, initial).then(res => {
        res.json().then(json => {
          var jsonOps = [];
          for (var i in json) {
            //var aVars = json[i].split('')
            jsonOps.push({ value: json[i] });
          }
          vm.options = jsonOps;
        });
        loading(false);
      });
    }, 350)
  }
});
