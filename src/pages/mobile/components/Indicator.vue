<script lang="jsx">
import {emitter as bus} from "@/utils/eventBus.ts";

export default {
  name: "Indicator",
  props: {
    activeIndex: {
      type: Number,
      default: () => 0
    },
    tabStyleWidth: {
      type: String,
      default: () => ''
    },
    tabTexts: {
      type: Array,
      default: () => []
    },
    tabRender: {
      type: Function,
      default: null
    },
    //用于和slidList绑定，因为一个页面可能有多个slidList，但只有一个indicator组件
    name: {
      type: String,
      default: () => ''
    },
  },
  data() {
    return {
      currentSlideItemIndex: this.activeIndex,
      tabIndicatorRelationActiveIndexLefts: [],//指标和slideItem的index的对应left,
      indicatorSpace: 0,//indicator之间的间距
    }
  },
  computed: {},
  render() {
    /*
    *   <div class="tabs" ref="tabs">
            <div class="tab"
            style="{width : tabStyleWidth}"
            v-for="(item,index) in tabTexts"
            :class="currentSlideItemIndex === index?'active':''"
            @click="changeIndex(index)">
            <span>{{ item }}</span></div>
        </div>
    * */
    return (
        <div className='indicator-ctn'>
          {this.tabRender ?
              this.tabRender() :
              <div className="tabs" ref="tabs">
                {
                  this.tabTexts.map((item, index) => {
                    return (
                        <div className={this.currentSlideItemIndex === index ? 'active tab' : 'tab'}
                             style={{width: this.tabStyleWidth || 100 / this.tabTexts.length + '%'}}
                             onClick={e => this.changeIndex(index)}
                        >
                          < span> {item}</span>
                        </div>
                    )
                  })
                }
              </div>
          }
          <div className="indicator" ref="indicator"
               style={{width: this.tabStyleWidth || 100 / this.tabTexts.length + '%'}}/>
        </div>
    )
  },
  mounted() {
    this.initTabs()
    bus.on(this.name + '-moved', this.move)
    bus.on(this.name + '-end', this.end)
  },
  methods: {
    changeIndex(index) {
      this.currentSlideItemIndex = index
      this.$attrs['onUpdate:active-index'] && this.$emit('update:active-index', this.currentSlideItemIndex)
      this.$setCss(this.indicatorRef, 'transition-duration', `300ms`)
      this.$setCss(this.indicatorRef, 'left', this.tabIndicatorRelationActiveIndexLefts[this.currentSlideItemIndex] + 'px')
    },
    initTabs() {
      let tabs = this.$refs.tabs
      this.indicatorRef = this.$refs.indicator
      for (let i = 0; i < tabs.children.length; i++) {
        let item = tabs.children[i]
        this.tabWidth = this.$getCss(item, 'width')
        this.tabIndicatorRelationActiveIndexLefts.push(
            item.getBoundingClientRect().x - tabs.children[0].getBoundingClientRect().x + (this.indicatorType === 'home' ? this.tabWidth * 0.15 : 0))
      }
      this.indicatorSpace = this.tabIndicatorRelationActiveIndexLefts[1] - this.tabIndicatorRelationActiveIndexLefts[0]
      this.$setCss(this.indicatorRef, 'transition-duration', `0ms`)
      this.$setCss(this.indicatorRef, 'left', this.tabIndicatorRelationActiveIndexLefts[this.currentSlideItemIndex] + 'px')
    },
    move(e) {
      this.$setCss(this.indicatorRef, 'left',
          this.tabIndicatorRelationActiveIndexLefts[this.currentSlideItemIndex] -
          e.x.distance / (this.$store.state.bodyWidth / this.indicatorSpace) + 'px')
    },
    end(index) {
      // console.log(index)
      this.currentSlideItemIndex = index
      this.$setCss(this.indicatorRef, 'transition-duration', `300ms`)
      this.$setCss(this.indicatorRef, 'left',
          this.tabIndicatorRelationActiveIndexLefts[this.currentSlideItemIndex] + 'px')
      setTimeout(() => {
        this.$setCss(this.indicatorRef, 'transition-duration', `0ms`)
      }, 300)
    }
  }
}
</script>

<style scoped lang="scss">

$main-bg: rgb(21, 23, 36);
$active-main-bg: rgb(31, 37, 52);
$second-text-color: rgb(143, 143, 158);
$second-btn-color: rgb(58, 58, 70);
$second-btn-color-tran: rgba(58, 58, 70, .4);
$line-color: rgb(37, 45, 66);
$line-color2: rgb(56, 54, 67);
$footer-color: black;

$primary-btn-color: rgb(252, 47, 86);
$disable-primary-btn-color: rgba(252, 47, 86, .5);

$mask-dark: #000000bb;
$mask-light: transparent;
$mask-white: transparent;
$mask-lightgray: rgba(0, 0, 0, 0.25);

$footer-height: 50rem;
$header-height: 50rem;
$indicator-height: 50rem;

$padding-page: 15rem;
.indicator-ctn {
  font-size: 14rem;
  width: 100%;
  height: $indicator-height;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background: $main-bg;

  .tabs {
    display: flex;
    justify-content: space-between;
    font-weight: bold;

    .tab {
      height: 45rem;
      width: 45%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: gray;
      transition: color .3s;

      &.active {
        color: white;
      }

      img {
        margin-left: 5rem;
        $width: 12rem;
        width: $width;
        height: $width;
      }
    }
  }

  .indicator {
    height: 2px;
    background: gold;
    width: 45%;
    position: relative;
    transition: all .3s;
  }
}

</style>
