select z.in_date,
       z.pt_kod,
       z.age,
       floor(exp(nvl(sum(
                       ln(1 - x.outg / 100)) over(partition by z.pt_kod, z.ovr order by z.in_date rows between unbounded preceding and 1 preceding),
                     0)) * z.psg)                  p_golov,
       z.f_golov,
       round(z.f_golov * x.massa / 1000, 2)        zh_massa_kg,
       round(z.f_golov * x.korma / 1000, 2)        korma_kg,
       round(z.f_golov * 1.75 * x.korma / 1000, 2) water_l
from (select x.*
      from (select ss.*, count(*) over(partition by ss.f_golov) vals_const_days
            from (select s.in_date,
                         s.pt_kod,
                         s.in_date - first_value(s.psd) over(partition by s.pt_kod, s.ovr order by s.in_date) +
                         nvl(first_value(s.age_in) over(partition by s.pt_kod, s.ovr order by s.in_date), 0) age,
                         first_value(s.g_in) over(partition by s.pt_kod, s.ovr order by s.in_date)           psg,
                         first_value(s.g_in) over(partition by s.pt_kod, s.ovr order by s.in_date) -
                         nvl(sum(s.g_out) over(partition by s.pt_kod, s.ovr order by s.in_date), 0)          f_golov,
                         s.ovr
                  from (select t.in_date,
                               t.pt_kod,
                               t.psd,
                               t.g_in,
                               t.age_in,
                               t.g_out,
                               sum(decode(t.g_in, null, 0, 1)) over(partition by t.pt_kod order by t.in_date) ovr
                        from (select d.in_date, d.pt_kod, y.psd, y.g_in, nvl(y.age_in, 0) age_in, nvl(y.g_out, 0) g_out
                              from (select in_date,
                                           pt_kod,
                                           max(decode(substr(pok_kod, -3), '108', in_date, null))         psd,
                                           sum(decode(substr(pok_kod, -3), '108', pok_zn, null))          g_in,
                                           ceil(avg(decode(substr(pok_kod, -3), '107', pok_zn, null)))    age_in,
                                           sum(decode(substr(pok_kod, -3), '109', -pok_zn, '201', pok_zn, '210', pok_zn,
                                                      '212', pok_zn, '214', pok_zn, '216', pok_zn, null)) g_out
                                    from main_view
                                    where (pf_kod = 3)
                                      and (pt_kod between 2000 and 3000)
                                      and (substr(pok_kod, -3) in
                                           ('107', '108', '109', '201', '210', '212', '214', '216'))
                                    group by in_date, pt_kod) y
                                     right join (select column_value in_date, (sek_kod * 1000 + pt_kod) pt_kod
                                                 from table(dates_seq(to_date('01.09.2004'), sysdate)),
                                  (select sek_kod, pt_kod from pt where (pf_kod = 3) and (sek_kod = 2))) d
                                       on (d.in_date = y.in_date) and (d.pt_kod = y.pt_kod)) t) s) ss) x
      where (x.vals_const_days <= 21)) z
       left join (select age,
                         ((10 * massa_k) + massa_p) / 11                                           massa,
                         ((10 * korma_k) + korma_p) / 11                                           korma,
                         ((10 * (pr_padega_k + pr_vibrakov_k) + pr_padega_p + pr_vibrakov_p) / 11) outg
                  from ttx_pm_pc) x on (x.age = decode(floor(z.age / 7), 0, 1, floor(z.age / 7)))