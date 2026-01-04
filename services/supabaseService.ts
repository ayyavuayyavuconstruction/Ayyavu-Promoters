import { supabase } from '../lib/supabase';
import { Project, Site, CompanySettings, PaymentRecord } from '../types';

export const companySettingsService = {
  async get(): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching company settings:', error);
      return null;
    }

    if (!data) return null;

    return {
      name: data.name,
      logoUrl: data.logo_url,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
    };
  },

  async update(settings: CompanySettings): Promise<boolean> {
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .maybeSingle();

    const payload = {
      name: settings.name,
      logo_url: settings.logoUrl,
      street: settings.street,
      city: settings.city,
      state: settings.state,
      zip: settings.zip,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from('company_settings')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating company settings:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('company_settings')
        .insert([payload]);

      if (error) {
        console.error('Error creating company settings:', error);
        return false;
      }
    }

    return true;
  },
};

export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return [];
    }

    if (!projectsData) return [];

    const { data: sitesData, error: sitesError } = await supabase
      .from('sites')
      .select(`
        *,
        payment_records(*)
      `);

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
    }

    const projects: Project[] = projectsData.map(proj => ({
      id: proj.id,
      name: proj.name,
      location: proj.location,
      launchDate: proj.launch_date,
      imageUrls: proj.image_urls || [],
      sites: (sitesData || [])
        .filter(site => site.project_id === proj.id)
        .map(site => ({
          id: site.id,
          number: site.number,
          status: site.status,
          customerName: site.customer_name,
          customerPhone: site.customer_phone,
          facing: site.facing,
          dimensions: site.dimensions,
          landAreaSqFt: parseFloat(site.land_area_sqft),
          landCostPerSqFt: parseFloat(site.land_cost_per_sqft),
          constructionAreaSqFt: parseFloat(site.construction_area_sqft),
          constructionRatePerSqFt: parseFloat(site.construction_rate_per_sqft),
          profitMarginPercentage: site.profit_margin_percentage ? parseFloat(site.profit_margin_percentage) : 0,
          imageUrls: site.image_urls || [],
          projectedCompletionDate: site.projected_completion_date,
          bookingDate: site.booking_date,
          saleDate: site.sale_date,
          tags: site.tags || [],
          payments: (site.payment_records || []).map((payment: any) => ({
            id: payment.id,
            amount: parseFloat(payment.amount),
            date: payment.date,
            method: payment.method,
            notes: payment.notes,
          })),
        })),
    }));

    return projects;
  },

  async create(project: Omit<Project, 'id' | 'sites'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        location: project.location,
        launch_date: project.launchDate,
        image_urls: project.imageUrls || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return data.id;
  },

  async update(id: string, project: Omit<Project, 'id' | 'sites'>): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        location: project.location,
        launch_date: project.launchDate,
        image_urls: project.imageUrls || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  },
};

export const siteService = {
  async create(projectId: string, site: Omit<Site, 'id'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('sites')
      .insert([{
        project_id: projectId,
        number: site.number,
        status: site.status,
        customer_name: site.customerName,
        customer_phone: site.customerPhone,
        facing: site.facing,
        dimensions: site.dimensions,
        land_area_sqft: site.landAreaSqFt,
        land_cost_per_sqft: site.landCostPerSqFt,
        construction_area_sqft: site.constructionAreaSqFt,
        construction_rate_per_sqft: site.constructionRatePerSqFt,
        profit_margin_percentage: site.profitMarginPercentage || 0,
        image_urls: site.imageUrls || [],
        projected_completion_date: site.projectedCompletionDate,
        booking_date: site.bookingDate,
        sale_date: site.saleDate,
        tags: site.tags || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating site:', error);
      return null;
    }

    return data.id;
  },

  async update(id: string, updates: Partial<Site>): Promise<boolean> {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.number !== undefined) payload.number = updates.number;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) payload.customer_phone = updates.customerPhone;
    if (updates.facing !== undefined) payload.facing = updates.facing;
    if (updates.dimensions !== undefined) payload.dimensions = updates.dimensions;
    if (updates.landAreaSqFt !== undefined) payload.land_area_sqft = updates.landAreaSqFt;
    if (updates.landCostPerSqFt !== undefined) payload.land_cost_per_sqft = updates.landCostPerSqFt;
    if (updates.constructionAreaSqFt !== undefined) payload.construction_area_sqft = updates.constructionAreaSqFt;
    if (updates.constructionRatePerSqFt !== undefined) payload.construction_rate_per_sqft = updates.constructionRatePerSqFt;
    if (updates.profitMarginPercentage !== undefined) payload.profit_margin_percentage = updates.profitMarginPercentage;
    if (updates.imageUrls !== undefined) payload.image_urls = updates.imageUrls;
    if (updates.projectedCompletionDate !== undefined) payload.projected_completion_date = updates.projectedCompletionDate;
    if (updates.bookingDate !== undefined) payload.booking_date = updates.bookingDate;
    if (updates.saleDate !== undefined) payload.sale_date = updates.saleDate;
    if (updates.tags !== undefined) payload.tags = updates.tags;

    const { error } = await supabase
      .from('sites')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating site:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting site:', error);
      return false;
    }

    return true;
  },
};

export const paymentService = {
  async create(siteId: string, payment: Omit<PaymentRecord, 'id'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('payment_records')
      .insert([{
        site_id: siteId,
        amount: payment.amount,
        date: payment.date,
        method: payment.method,
        notes: payment.notes,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    return data.id;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payment_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      return false;
    }

    return true;
  },
};
