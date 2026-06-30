import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { AppHeader } from '@/components/AppHeader';

export const metadata = { title: 'Reglas — Prode Binda 2026' };

export default async function RulesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.nickname) redirect('/onboarding');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pb-12">
      <AppHeader nickname={user.nickname} current="rules" />

      <Section title="Estructura">
        <p>
          El Prode tiene un <strong>campeón general</strong> (más puntos totales)
          y se divide en <strong>3 etapas</strong>, cada una con su ganador. Los
          puntajes se reinician entre etapas pero se suman para el general.
        </p>
        <Bullets
          items={[
            ['Etapa 1', 'Fase de grupos (72 partidos)'],
            ['Etapa 2', '16vos + 8vos (24 partidos)'],
            ['Etapa 3', '4tos, semis, 3er puesto y Final (8 partidos)'],
          ]}
        />
      </Section>

      <Section title="Puntaje por partido">
        <PointsTable />
      </Section>

      <Section title="Reglas operativas">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Podés cargar y editar pronósticos hasta el inicio del partido.</li>
          <li>
            Una vez iniciado el partido, ya no se puede modificar y se publican
            todos los pronósticos.
          </li>
          <li>
            Las etapas 2 y 3 se habilitan al finalizar las etapas anteriores.
          </li>
          <li>Si no cargás pronóstico, obtenés 0 puntos por ese partido.</li>
          <li>
            En knockout, los goles cuentan el tiempo regular + prórroga, sin
            sumar penales.
          </li>
        </ol>
      </Section>

      <Section title="Premios">
        <p>El pozo se reparte así:</p>
        <Bullets
          items={[
            ['Campeón general', '40%'],
            ['Campeón Etapa 1', '20%'],
            ['Campeón Etapa 2', '20%'],
            ['Campeón Etapa 3', '20%'],
          ]}
        />
        <p className="text-sm text-pb-muted">
          Ante empate entre campeones de una etapa, el premio se reparte
          equitativamente.
        </p>
      </Section>

      <Link
        href="/cuenta"
        className="rounded-2xl border-[1.5px] border-pb-navy py-3 text-center font-display text-sm font-bold uppercase tracking-wider text-pb-navy hover:bg-pb-navy/5"
      >
        Mi cuenta
      </Link>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
      <h2 className="font-display text-base font-bold text-pb-navy">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-pb-deep-blue">
        {children}
      </div>
    </section>
  );
}

function Bullets({ items }: { items: Array<[string, string]> }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map(([k, v]) => (
        <li key={k} className="flex items-baseline justify-between gap-3">
          <span className="font-display text-sm font-bold text-pb-deep-blue">
            {k}
          </span>
          <span className="text-sm text-pb-muted text-right">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function PointsTable() {
  const data: Array<{
    stage: string;
    multiplier: string;
    rows: Array<[string, string]>;
  }> = [
    {
      stage: 'Etapa 1 — Grupos',
      multiplier: 'x1',
      rows: [
        ['Resultado (gana A / empate / gana B)', '+1'],
      ],
    },
    {
      stage: 'Etapa 2 — 16vos + 8vos',
      multiplier: 'x2',
      rows: [
        ['Quién pasa', '+3'],
        ['Goles exactos equipo A', '+2'],
        ['Goles exactos equipo B', '+2'],
        ['Acertar si fue a penales', '+2'],
      ],
    },
    {
      stage: 'Etapa 3 — Cuartos+',
      multiplier: 'x3',
      rows: [
        ['Quién pasa', '+4'],
        ['Goles exactos equipo A', '+3'],
        ['Goles exactos equipo B', '+3'],
        ['Acertar si fue a penales', '+3'],
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {data.map((s) => (
        <div key={s.stage} className="rounded-2xl border border-pb-border p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-sm font-bold text-pb-navy">
              {s.stage}
            </span>
            <span className="font-display text-xs font-bold text-pb-ceruleo">
              {s.multiplier}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {s.rows.map(([k, v]) => (
              <li
                key={k}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-pb-deep-blue">{k}</span>
                <span className="font-display font-bold text-pb-deep-blue">
                  {v}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
