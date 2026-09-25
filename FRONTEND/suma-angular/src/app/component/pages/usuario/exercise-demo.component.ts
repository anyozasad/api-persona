import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-exercise-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="exercise-demo" [class.is-paused]="pausado">
      <header class="exercise-demo-head">
        <div>
          <span>GUÍA VISUAL</span>
          <h3>{{ejercicio?.nombre || 'Ejercicio'}}</h3>
          <p>{{mensajeGuia}}</p>
        </div>
        <em>{{pausado ? 'PAUSADO' : 'EN MOVIMIENTO'}}</em>
      </header>

      <div class="exercise-demo-stage" [attr.data-demo]="modo">
        <div class="demo-grid"></div>
        <span class="demo-side" *ngIf="ejercicio?.por_lado">
          {{lado === 'derecho' ? 'LADO DERECHO' : 'LADO IZQUIERDO'}}
        </span>

        <img
          *ngIf="modo==='deadbug'"
          class="exercise-human-image"
          src="/assets/exercises/deadbug_human.webp"
          [alt]="'Persona realizando '+(ejercicio?.nombre || 'Dead bug básico')">

        <svg *ngIf="modo!=='deadbug'" viewBox="0 0 360 250" role="img" [attr.aria-label]="'Persona demostrando '+(ejercicio?.nombre || 'ejercicio')">
          <defs>
            <linearGradient id="skinFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f2c39f"></stop>
              <stop offset="100%" stop-color="#c9875f"></stop>
            </linearGradient>
            <linearGradient id="shirtStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8995a3"></stop>
              <stop offset="100%" stop-color="#4d5968"></stop>
            </linearGradient>
            <linearGradient id="pantsStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#303948"></stop>
              <stop offset="100%" stop-color="#151d29"></stop>
            </linearGradient>
            <filter id="personShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#00101f" flood-opacity=".32"></feDropShadow>
            </filter>
          </defs>

          <line class="demo-floor" x1="34" y1="220" x2="326" y2="220"></line>

          <!-- De pie / marcha / talones / brazos -->
          <g *ngIf="['standing','march','calf','arms','palms','row','abduction','kickback'].includes(modo)" class="pose pose-standing">
            <circle class="body-head" cx="180" cy="52" r="17"></circle>
            <line class="body-torso" x1="180" y1="70" x2="180" y2="142"></line>

            <g class="arm-left">
              <line class="body-limb" x1="180" y1="84" x2="145" y2="112"></line>
              <line class="body-limb" x1="145" y1="112" x2="135" y2="149"></line>
            </g>
            <g class="arm-right">
              <line class="body-limb" x1="180" y1="84" x2="215" y2="112"></line>
              <line class="body-limb" x1="215" y1="112" x2="225" y2="149"></line>
            </g>

            <g class="leg-left">
              <line class="body-limb body-leg" x1="180" y1="142" x2="157" y2="181"></line>
              <line class="body-limb body-leg" x1="157" y1="181" x2="151" y2="219"></line>
            </g>
            <g class="leg-right">
              <line class="body-limb body-leg" x1="180" y1="142" x2="203" y2="181"></line>
              <line class="body-limb body-leg" x1="203" y1="181" x2="209" y2="219"></line>
            </g>
          </g>

          <!-- Sentadilla -->
          <g *ngIf="modo==='squat'" class="pose pose-squat">
            <g class="squat-upper">
              <circle class="body-head" cx="180" cy="52" r="17"></circle>
              <line class="body-torso" x1="180" y1="70" x2="180" y2="139"></line>
              <line class="body-limb" x1="180" y1="88" x2="144" y2="111"></line>
              <line class="body-limb" x1="144" y1="111" x2="122" y2="91"></line>
              <line class="body-limb" x1="180" y1="88" x2="216" y2="111"></line>
              <line class="body-limb" x1="216" y1="111" x2="238" y2="91"></line>
            </g>
            <g class="squat-legs">
              <polyline class="body-limb body-leg" points="180,139 151,174 129,218"></polyline>
              <polyline class="body-limb body-leg" points="180,139 209,174 231,218"></polyline>
            </g>
            <rect class="demo-prop" x="250" y="170" width="54" height="12" rx="5"></rect>
            <line class="demo-prop-line" x1="258" y1="182" x2="258" y2="220"></line>
            <line class="demo-prop-line" x1="296" y1="182" x2="296" y2="220"></line>
          </g>

          <!-- Zancada -->
          <g *ngIf="modo==='lunge'" class="pose pose-lunge">
            <g class="lunge-upper">
              <circle class="body-head" cx="180" cy="49" r="17"></circle>
              <line class="body-torso" x1="180" y1="67" x2="180" y2="139"></line>
              <line class="body-limb" x1="180" y1="85" x2="147" y2="115"></line>
              <line class="body-limb" x1="180" y1="85" x2="213" y2="115"></line>
            </g>
            <g class="lunge-front">
              <polyline class="body-limb body-leg" points="180,139 151,174 151,218"></polyline>
            </g>
            <g class="lunge-back">
              <polyline class="body-limb body-leg" points="180,139 214,173 249,218"></polyline>
            </g>
          </g>

          <!-- Pared -->
          <g *ngIf="modo==='wall'" class="pose pose-wall">
            <line class="demo-wall" x1="287" y1="36" x2="287" y2="220"></line>
            <g class="wall-person">
              <circle class="body-head" cx="153" cy="63" r="17"></circle>
              <line class="body-torso" x1="162" y1="79" x2="193" y2="147"></line>
              <polyline class="body-limb" points="170,91 221,109 278,109"></polyline>
              <polyline class="body-limb body-leg" points="193,147 169,180 156,219"></polyline>
              <polyline class="body-limb body-leg" points="193,147 205,184 212,219"></polyline>
            </g>
          </g>

          <!-- Bird dog -->
          <g *ngIf="modo==='birddog'" class="pose pose-birddog">
            <circle class="body-head" cx="111" cy="118" r="15"></circle>
            <line class="body-torso" x1="128" y1="130" x2="216" y2="142"></line>
            <g class="bird-arm-active">
              <line class="body-limb" x1="139" y1="133" x2="84" y2="153"></line>
              <line class="body-limb" x1="84" y1="153" x2="49" y2="138"></line>
            </g>
            <g class="bird-arm-base">
              <polyline class="body-limb" points="151,136 139,178 130,219"></polyline>
            </g>
            <g class="bird-leg-active">
              <line class="body-limb body-leg" x1="211" y1="142" x2="267" y2="146"></line>
              <line class="body-limb body-leg" x1="267" y1="146" x2="317" y2="132"></line>
            </g>
            <g class="bird-leg-base">
              <polyline class="body-limb body-leg" points="202,145 199,184 214,219"></polyline>
            </g>
          </g>

          <!-- Dead bug -->
          <g *ngIf="modo==='deadbug'" class="pose pose-deadbug">
            <circle class="body-head" cx="91" cy="176" r="15"></circle>
            <line class="body-torso" x1="108" y1="176" x2="199" y2="176"></line>
            <g class="dead-arm-left">
              <line class="body-limb" x1="136" y1="174" x2="136" y2="116"></line>
              <line class="body-limb" x1="136" y1="116" x2="119" y2="78"></line>
            </g>
            <g class="dead-arm-right">
              <line class="body-limb" x1="151" y1="174" x2="170" y2="116"></line>
              <line class="body-limb" x1="170" y1="116" x2="205" y2="85"></line>
            </g>
            <g class="dead-leg-left">
              <polyline class="body-limb body-leg" points="198,176 229,146 247,111"></polyline>
            </g>
            <g class="dead-leg-right">
              <polyline class="body-limb body-leg" points="198,176 239,182 287,181"></polyline>
            </g>
          </g>

          <!-- Puente de cadera -->
          <g *ngIf="modo==='bridge'" class="pose pose-bridge">
            <circle class="body-head" cx="83" cy="184" r="15"></circle>
            <line class="body-torso bridge-torso" x1="101" y1="184" x2="201" y2="164"></line>
            <g class="bridge-hip">
              <polyline class="body-limb body-leg" points="198,165 234,184 246,219"></polyline>
              <polyline class="body-limb body-leg" points="190,168 217,191 221,219"></polyline>
            </g>
            <line class="body-limb" x1="120" y1="185" x2="84" y2="211"></line>
          </g>

          <!-- Cobra -->
          <g *ngIf="modo==='cobra'" class="pose pose-cobra">
            <g class="cobra-upper">
              <circle class="body-head" cx="104" cy="126" r="15"></circle>
              <line class="body-torso" x1="120" y1="137" x2="202" y2="178"></line>
              <polyline class="body-limb" points="142,148 126,184 121,219"></polyline>
              <polyline class="body-limb" points="158,157 150,190 149,219"></polyline>
            </g>
            <line class="body-limb body-leg" x1="202" y1="178" x2="298" y2="213"></line>
          </g>

          <!-- Respiración -->
          <g *ngIf="modo==='breathe'" class="pose pose-breathe">
            <circle class="body-head" cx="180" cy="52" r="17"></circle>
            <line class="body-torso" x1="180" y1="70" x2="180" y2="150"></line>
            <line class="body-limb" x1="180" y1="88" x2="147" y2="128"></line>
            <line class="body-limb" x1="180" y1="88" x2="213" y2="128"></line>
            <polyline class="body-limb body-leg" points="180,150 154,184 151,219"></polyline>
            <polyline class="body-limb body-leg" points="180,150 206,184 209,219"></polyline>
            <circle class="breath-ring one" cx="180" cy="112" r="24"></circle>
            <circle class="breath-ring two" cx="180" cy="112" r="24"></circle>
          </g>
        </svg>

        <div class="demo-caption">
          <span>{{pasoCorto}}</span>
          <b>{{prescripcion}}</b>
        </div>
      </div>

      <footer class="exercise-demo-foot">
        <span><i></i> Muévete con control</span>
        <span *ngIf="ejercicio?.por_lado">↔ Cambia de lado cuando el sistema lo indique</span>
        <span>■ Detente si algo duele</span>
      </footer>
    </section>
  `,
  styles: [`
    :host{display:block;min-width:0}
    .exercise-demo{display:grid;gap:14px;min-width:0}
    .exercise-demo-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
    .exercise-demo-head>div>span{display:block;font-size:9px;font-weight:900;letter-spacing:1.15px;color:#7e92a6}
    .exercise-demo-head h3{margin:4px 0 3px;font-size:21px;color:#0d2a49;line-height:1.1}
    .exercise-demo-head p{margin:0;max-width:520px;font-size:11px;line-height:1.5;color:#74879a}
    .exercise-demo-head em{font-style:normal;padding:6px 9px;border-radius:999px;background:#eaf8f1;color:#257458;font-size:8px;font-weight:900}
    .exercise-demo.is-paused .exercise-demo-head em{background:#fff4df;color:#a66d14}
    .exercise-demo-stage{position:relative;min-height:330px;overflow:hidden;border-radius:20px;background:linear-gradient(145deg,#071a32,#0b3159);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
    .demo-grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:30px 30px;mask-image:linear-gradient(to bottom,transparent,black 22%,black 85%,transparent)}
    .exercise-demo-stage:after{
      content:'PERSONA · GUÍA DE MOVIMIENTO';
      position:absolute;
      z-index:4;
      right:18px;
      top:18px;
      padding:7px 10px;
      border-radius:999px;
      background:rgba(255,255,255,.10);
      border:1px solid rgba(255,255,255,.10);
      color:#dbe7f2;
      font-size:7px;
      font-weight:900;
      letter-spacing:.75px;
      backdrop-filter:blur(8px)
    }
    .exercise-demo-stage:before{content:'';position:absolute;width:220px;height:220px;right:-70px;top:-80px;border-radius:50%;background:radial-gradient(circle,rgba(239,35,60,.18),transparent 68%)}
    .exercise-demo-stage svg{position:relative;z-index:2;display:block;width:100%;height:280px;padding:18px 26px 0;box-sizing:border-box}
    .exercise-human-image{
      position:absolute;
      z-index:2;
      inset:0;
      width:100%;
      height:100%;
      object-fit:cover;
      object-position:center;
      display:block;
      filter:saturate(.96) contrast(1.03)
    }
    .demo-floor{stroke:rgba(255,255,255,.18);stroke-width:5;stroke-linecap:round}
    .body-head{
      fill:url(#skinFill);
      stroke:#7b4d35;
      stroke-width:2;
      filter:url(#personShadow)
    }
    .body-torso{
      fill:none;
      stroke:url(#shirtStroke);
      stroke-width:30;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:url(#personShadow)
    }
    .body-limb{
      fill:none;
      stroke:#d99b72;
      stroke-width:15;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:url(#personShadow)
    }
    .body-leg{
      stroke:url(#pantsStroke);
      stroke-width:19
    }
    .demo-prop{fill:rgba(255,255,255,.14);stroke:rgba(255,255,255,.24)}
    .demo-prop-line,.demo-wall{stroke:rgba(255,255,255,.28);stroke-width:5;stroke-linecap:round}
    .pose g,.pose line,.pose polyline,.pose circle{transform-box:fill-box}
    .demo-side{position:absolute;z-index:4;left:18px;top:18px;padding:7px 9px;border-radius:999px;background:rgba(239,35,60,.92);color:#fff;font-size:8px;font-weight:900;letter-spacing:.8px}
    .demo-caption{position:absolute;z-index:4;left:18px;right:18px;bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 12px;border-radius:12px;background:rgba(5,20,40,.72);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(10px)}
    .demo-caption span{font-size:10px;color:#c6d5e3}
    .demo-caption b{font-size:10px;color:#fff;text-align:right}
    .exercise-demo-foot{display:flex;flex-wrap:wrap;gap:8px 14px}
    .exercise-demo-foot span{display:inline-flex;align-items:center;gap:6px;font-size:9px;color:#6e8194}
    .exercise-demo-foot i{width:7px;height:7px;border-radius:50%;background:#36b884}

    .is-paused .pose *{animation-play-state:paused!important}

    /* Standing animation families */
    [data-demo="standing"] .pose-standing{animation:floatBody 2.4s ease-in-out infinite}
    [data-demo="march"] .leg-left{transform-origin:top center;animation:marchLeft 1.15s ease-in-out infinite}
    [data-demo="march"] .leg-right{transform-origin:top center;animation:marchRight 1.15s ease-in-out infinite}
    [data-demo="march"] .arm-left{transform-origin:top center;animation:armWalkLeft 1.15s ease-in-out infinite}
    [data-demo="march"] .arm-right{transform-origin:top center;animation:armWalkRight 1.15s ease-in-out infinite}
    [data-demo="calf"] .pose-standing{animation:calfRaise 1.8s ease-in-out infinite}
    [data-demo="arms"] .arm-left{transform-origin:top right;animation:armRaiseLeft 2s ease-in-out infinite}
    [data-demo="arms"] .arm-right{transform-origin:top left;animation:armRaiseRight 2s ease-in-out infinite}
    [data-demo="palms"] .arm-left{transform-origin:top right;animation:palmsLeft 1.6s ease-in-out infinite}
    [data-demo="palms"] .arm-right{transform-origin:top left;animation:palmsRight 1.6s ease-in-out infinite}
    [data-demo="row"] .arm-left{transform-origin:top right;animation:rowLeft 1.8s ease-in-out infinite}
    [data-demo="row"] .arm-right{transform-origin:top left;animation:rowRight 1.8s ease-in-out infinite}
    [data-demo="abduction"] .leg-left{transform-origin:top center;animation:abductLeft 2s ease-in-out infinite}
    [data-demo="kickback"] .leg-right{transform-origin:top center;animation:kickBack 2s ease-in-out infinite}

    .squat-upper{animation:squatUpper 2.2s ease-in-out infinite}
    .squat-legs{animation:squatLegs 2.2s ease-in-out infinite}
    .lunge-upper{animation:lungeUpper 2.4s ease-in-out infinite}
    .lunge-front{transform-origin:top center;animation:lungeFront 2.4s ease-in-out infinite}
    .lunge-back{transform-origin:top center;animation:lungeBack 2.4s ease-in-out infinite}
    .wall-person{transform-origin:center;animation:wallPush 2s ease-in-out infinite}
    .bird-arm-active{transform-origin:right center;animation:birdArm 2.3s ease-in-out infinite}
    .bird-leg-active{transform-origin:left center;animation:birdLeg 2.3s ease-in-out infinite}
    .dead-arm-right{transform-origin:left bottom;animation:deadArm 2.4s ease-in-out infinite}
    .dead-leg-right{transform-origin:left center;animation:deadLeg 2.4s ease-in-out infinite}
    .bridge-torso,.bridge-hip{animation:bridgeLift 2.2s ease-in-out infinite}
    .cobra-upper{transform-origin:right bottom;animation:cobraLift 2.6s ease-in-out infinite}
    .breath-ring{fill:none;stroke:#ff5268;stroke-width:4;transform-origin:center;opacity:0}
    .breath-ring.one{animation:breatheRing 3.8s ease-out infinite}
    .breath-ring.two{animation:breatheRing 3.8s 1.9s ease-out infinite}

    @keyframes floatBody{50%{transform:translateY(-4px)}}
    @keyframes calfRaise{50%{transform:translateY(-11px)}}
    @keyframes marchLeft{50%{transform:rotate(-23deg) translateY(-8px)}}
    @keyframes marchRight{50%{transform:rotate(20deg) translateY(5px)}}
    @keyframes armWalkLeft{50%{transform:rotate(17deg)}}
    @keyframes armWalkRight{50%{transform:rotate(-17deg)}}
    @keyframes armRaiseLeft{50%{transform:rotate(72deg) translate(8px,-3px)}}
    @keyframes armRaiseRight{50%{transform:rotate(-72deg) translate(-8px,-3px)}}
    @keyframes palmsLeft{50%{transform:rotate(-24deg) translate(10px,-3px)}}
    @keyframes palmsRight{50%{transform:rotate(24deg) translate(-10px,-3px)}}
    @keyframes rowLeft{50%{transform:rotate(28deg) translate(3px,-4px)}}
    @keyframes rowRight{50%{transform:rotate(-28deg) translate(-3px,-4px)}}
    @keyframes abductLeft{50%{transform:rotate(29deg)}}
    @keyframes kickBack{50%{transform:rotate(-25deg) translateX(10px)}}
    @keyframes squatUpper{50%{transform:translateY(29px)}}
    @keyframes squatLegs{50%{transform:translateY(18px) scaleY(.84)}}
    @keyframes lungeUpper{50%{transform:translateY(22px)}}
    @keyframes lungeFront{50%{transform:rotate(8deg) translateY(8px)}}
    @keyframes lungeBack{50%{transform:rotate(-8deg) translateY(8px)}}
    @keyframes wallPush{50%{transform:translate(33px,5px) rotate(2deg)}}
    @keyframes birdArm{50%{transform:rotate(-17deg) translateX(-11px)}}
    @keyframes birdLeg{50%{transform:rotate(10deg) translateX(10px)}}
    @keyframes deadArm{50%{transform:rotate(-36deg) translate(12px,14px)}}
    @keyframes deadLeg{50%{transform:rotate(27deg) translate(-4px,20px)}}
    @keyframes bridgeLift{50%{transform:translateY(-24px) rotate(-3deg)}}
    @keyframes cobraLift{50%{transform:rotate(-14deg) translateY(-15px)}}
    @keyframes breatheRing{0%{transform:scale(.65);opacity:.7}70%,100%{transform:scale(1.7);opacity:0}}

    @media(max-width:700px){
      .exercise-demo-stage{min-height:290px}
      .exercise-demo-stage svg{height:245px;padding-left:10px;padding-right:10px}
      .exercise-demo-head{align-items:flex-start;flex-direction:column}
      .exercise-demo-head h3{font-size:18px}
      .demo-caption{align-items:flex-start;flex-direction:column}
      .demo-caption b{text-align:left}
    }
    @media(prefers-reduced-motion:reduce){
      .pose *,.pose,.breath-ring{animation:none!important}
    }
  `]
})
export class ExerciseDemoComponent {
  @Input() ejercicio: any = null;
  @Input() pausado = false;
  @Input() lado: 'derecho' | 'izquierdo' = 'derecho';

  get modo(): string {
    const id = String(this.ejercicio?.id || '');
    if (['sentadilla_silla','sentadilla_gluteos'].includes(id)) return 'squat';
    if (id === 'zancada_asistida') return 'lunge';
    if (id === 'talones') return 'calf';
    if (['marcha','rodilla_mano'].includes(id)) return 'march';
    if (['flexion_pared_brazos','flexion_pared_pecho','extension_triceps_pared','plancha_pared_pecho'].includes(id)) return 'wall';
    if (['circulos_brazos','apertura_brazos','elevacion_lateral_hombros','deslizamiento_pared','angel_pared','circulos_hombros'].includes(id)) return 'arms';
    if (['empuje_palmas','presion_pecho'].includes(id)) return 'palms';
    if (['remo_isometrico','rotacion_externa'].includes(id)) return 'row';
    if (['bird_dog_espalda','bird_dog_core'].includes(id)) return 'birddog';
    if (id === 'cobra_suave') return 'cobra';
    if (id === 'puente_gluteos') return 'bridge';
    if (id === 'abduccion_pie') return 'abduction';
    if (id === 'patada_atras') return 'kickback';
    if (id === 'dead_bug') return 'deadbug';
    if (id === 'respiracion_core') return 'breathe';
    return 'standing';
  }

  get mensajeGuia(): string {
    const mensajes: Record<string,string> = {
      squat: 'Baja con control y vuelve a subir sin rebotar.',
      lunge: 'Mantén el equilibrio y baja solo hasta un rango cómodo.',
      calf: 'Sube y baja los talones lentamente.',
      march: 'Alterna ambos lados con el torso estable.',
      wall: 'Acércate a la pared con el cuerpo alineado y vuelve con control.',
      arms: 'Mueve los brazos despacio y evita encoger los hombros.',
      palms: 'Presiona, relaja y mantén la respiración natural.',
      row: 'Lleva los codos hacia atrás con movimientos suaves.',
      birddog: 'Extiende brazo y pierna contraria sin arquear la espalda.',
      cobra: 'Eleva el pecho suavemente sin forzar la zona lumbar.',
      bridge: 'Eleva la cadera y baja lentamente.',
      abduction: 'Eleva la pierna al costado sin inclinar el torso.',
      kickback: 'Lleva la pierna hacia atrás sin arquear la espalda.',
      deadbug: 'Alterna brazo y pierna contraria manteniendo la espalda estable.',
      breathe: 'Respira lento y mantén el abdomen estable.'
    };
    return mensajes[this.modo] || 'Sigue la demostración a un ritmo cómodo y controlado.';
  }

  get pasoCorto(): string {
    if (this.ejercicio?.por_lado) return this.lado === 'derecho' ? 'Primero lado derecho' : 'Ahora lado izquierdo';
    if (this.ejercicio?.modo === 'tiempo') return 'Mantén un ritmo cómodo';
    return 'Repite el movimiento con control';
  }

  get prescripcion(): string {
    if (!this.ejercicio) return '';
    if (this.ejercicio.modo === 'tiempo') return `${this.ejercicio.segundos || 0} segundos`;
    const reps = Number(this.ejercicio.repeticiones || 0);
    return this.ejercicio.por_lado ? `${reps} por cada lado` : `${reps} repeticiones`;
  }
}
